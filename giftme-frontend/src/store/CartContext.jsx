import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getProductById } from '../api/products.js'
import { extractErrorMessage } from '../lib/api.js'

/**
 * The cart.
 *
 * MISSING API — and deliberately so: the backend has no cart resource. Its
 * checkout is a single atomic `POST /api/orders` that prices, validates and
 * reserves stock for the whole basket at once (guest COD is first-class, so
 * there is no session to hang a server-side cart off). A cart endpoint would
 * have to be invented, which the brief forbids.
 *
 * So the cart lives in this browser — but it stores *intent only*:
 *
 *     { lineId, productId, quantity, customization }
 *
 * No name, no price, no image, no stock. Every one of those is read live from
 * `GET /api/products/{id}` each time the cart hydrates, which is what stops a
 * stale localStorage copy from ever showing a shopper a price the backend
 * would not honour. A product that has since been deleted or deactivated
 * surfaces as an unavailable line rather than silently disappearing or
 * silently checking out.
 *
 * The subtotal below is arithmetic over backend-supplied unit prices, not a
 * pricing rule — `POST /api/orders` recomputes it server-side regardless and
 * its answer is the one the customer is charged.
 */

const STORAGE_KEY = 'giftme_cart'

const CartContext = createContext(null)

function readStoredItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) => item && Number.isFinite(Number(item.productId)) && Number(item.quantity) > 0,
    )
  } catch {
    return []
  }
}

/** Lines are keyed by identity, not by product: the same mug personalized two
 *  different ways is two lines, exactly as the backend models it (one
 *  Customization per OrderItem). */
function makeLineId() {
  return `line_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

/** Two lines merge only when the personalization is identical too. */
function sameCustomization(a, b) {
  const normalize = (value) => JSON.stringify(value ?? null)
  return normalize(a) === normalize(b)
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredItems)
  const [products, setProducts] = useState({})
  const [hydrating, setHydrating] = useState(false)
  const [hydrationError, setHydrationError] = useState(null)

  // Ids that came back 404 / inactive — remembered so we don't retry them on
  // every render and so the line can render an explicit "no longer available".
  const [unavailableIds, setUnavailableIds] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Quota or private mode — the cart still works for this page view.
    }
  }, [items])

  const productIds = useMemo(
    () => [...new Set(items.map((item) => Number(item.productId)))].sort((a, b) => a - b),
    [items],
  )
  const productIdsKey = productIds.join(',')

  const requestId = useRef(0)

  const hydrate = useCallback(async () => {
    const ids = productIdsKey ? productIdsKey.split(',').map(Number) : []
    if (ids.length === 0) {
      setProducts({})
      setUnavailableIds([])
      setHydrationError(null)
      return
    }

    const id = ++requestId.current
    setHydrating(true)
    setHydrationError(null)

    const results = await Promise.allSettled(ids.map((productId) => getProductById(productId)))
    if (id !== requestId.current) return

    const nextProducts = {}
    const nextUnavailable = []
    let transportError = null

    results.forEach((result, index) => {
      const productId = ids[index]
      if (result.status === 'fulfilled') {
        // The public endpoint only serves active products, but guard anyway —
        // an inactive product must never be checkout-able.
        if (result.value?.active === false) nextUnavailable.push(productId)
        else nextProducts[productId] = result.value
        return
      }

      const status = result.reason?.response?.status
      if (status === 404 || status === 400) nextUnavailable.push(productId)
      else transportError = result.reason
    })

    setProducts(nextProducts)
    setUnavailableIds(nextUnavailable)
    // Only a real transport/server failure is an error state; a deleted product
    // is a per-line condition the cart can render around.
    setHydrationError(transportError ? extractErrorMessage(transportError) : null)
    setHydrating(false)
  }, [productIdsKey])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const addItem = useCallback((product, { quantity = 1, customization = null } = {}) => {
    const productId = Number(product.id)
    setItems((current) => {
      const match = current.find(
        (item) =>
          Number(item.productId) === productId && sameCustomization(item.customization, customization),
      )
      if (match) {
        return current.map((item) =>
          item.lineId === match.lineId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...current, { lineId: makeLineId(), productId, quantity, customization }]
    })
    // Optimistically seed the product so the header badge and drawer can render
    // before the next hydrate settles. Hydration still overwrites it.
    setProducts((current) => ({ ...current, [productId]: product }))
  }, [])

  const updateQuantity = useCallback((lineId, quantity) => {
    const next = Math.max(0, Math.floor(Number(quantity) || 0))
    setItems((current) =>
      next === 0
        ? current.filter((item) => item.lineId !== lineId)
        : current.map((item) => (item.lineId === lineId ? { ...item, quantity: next } : item)),
    )
  }, [])

  const removeItem = useCallback((lineId) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  /** Intent joined with live catalog data. `product` is null when unavailable. */
  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = products[Number(item.productId)] ?? null
        const unitPrice = product ? Number(product.price) : 0
        return {
          ...item,
          product,
          unavailable: !product,
          // Stock is authoritative on the backend; this only lets the UI warn
          // before checkout instead of after a 409.
          exceedsStock: Boolean(product) && item.quantity > Number(product.stock ?? 0),
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        }
      }),
    [items, products],
  )

  const availableLines = useMemo(() => lines.filter((line) => !line.unavailable), [lines])

  const subtotal = useMemo(
    () => availableLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [availableLines],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  /** Exactly the `items` array `POST /api/orders` expects — no prices. */
  const toOrderItems = useCallback(
    () =>
      availableLines.map((line) => ({
        productId: Number(line.productId),
        quantity: line.quantity,
        customization: line.customization ?? undefined,
      })),
    [availableLines],
  )

  const value = useMemo(
    () => ({
      lines,
      availableLines,
      itemCount,
      subtotal,
      hydrating,
      hydrationError,
      unavailableIds,
      hasUnavailable: unavailableIds.length > 0,
      hasStockIssue: lines.some((line) => line.exceedsStock),
      isEmpty: items.length === 0,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      retryHydrate: hydrate,
      toOrderItems,
    }),
    [
      lines,
      availableLines,
      itemCount,
      subtotal,
      hydrating,
      hydrationError,
      unavailableIds,
      items.length,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      hydrate,
      toOrderItems,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
