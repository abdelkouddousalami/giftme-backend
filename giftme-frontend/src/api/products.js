import { apiClient } from '../lib/api.js'

/**
 * Public catalog — `GET /api/products` (ProductController).
 *
 * The backend already does category filtering, free-text search, sorting and
 * pagination (ProductService.list + ProductSpecifications), so the storefront
 * never filters or sorts a page of results client-side. Every knob on the shop
 * page maps to a query parameter here.
 *
 * IMPORTANT — "active" filtering applies to the LISTING only. `list()` passes
 * `active = true` into its Specification, but `getById` and `getBySlug` are bare
 * repository lookups: an inactive product is still served, with HTTP 200 and
 * `active: false` (verified against a running backend, and stated outright in a
 * comment in ProductServiceImpl.list). The README's "active products only" note
 * describes `GET /api/products` and does not extend to the two single-product
 * endpoints.
 *
 * So every caller of `getById`/`getBySlug` must check `active` itself before
 * letting a shopper order the thing — the product page and CartContext both do.
 */

/** Spring pages are zero-based; the shop page shows 1-based numbers. */
export const PAGE_SIZE = 12

/**
 * @param {object} params
 * @param {string} [params.category]  exact `product.category` value (e.g. "Mugs")
 * @param {string} [params.search]    free text, matched against name/description
 * @param {number} [params.page]      zero-based page index
 * @param {number} [params.size]      page size
 * @param {string} [params.sort]      Spring sort expression, e.g. "price,asc"
 * @returns {Promise<import('./types.js').PagedProducts>}
 */
export async function listProducts({ category, search, page = 0, size = PAGE_SIZE, sort } = {}) {
  const { data } = await apiClient.get('/api/products', {
    // Undefined params are dropped by axios, so an unset filter never reaches
    // the backend as an empty string (which its Specification would treat as a
    // real, always-failing filter).
    params: {
      category: category || undefined,
      search: search || undefined,
      page,
      size,
      sort: sort || undefined,
    },
  })
  return data.data
}

/** `GET /api/products/{id}` */
export async function getProductById(id) {
  const { data } = await apiClient.get(`/api/products/${id}`)
  return data.data
}

/** `GET /api/products/slug/{slug}` — what the product page routes on. */
export async function getProductBySlug(slug) {
  const { data } = await apiClient.get(`/api/products/slug/${slug}`)
  return data.data
}

/**
 * The distinct categories in the catalog.
 *
 * MISSING API: the backend has no `GET /api/categories`. `category` is a plain
 * VARCHAR(100) on the product row with no dedicated table, endpoint, or
 * ordering, so the only truthful way to build a category list is to derive it
 * from the products themselves. We ask for one large page and collect the
 * distinct values rather than inventing a hardcoded list that would silently
 * drift the moment an admin adds a category.
 *
 * Worth adding backend-side if the catalog ever outgrows one page.
 */
export async function listCategories() {
  const page = await listProducts({ size: 100, sort: 'category,asc' })
  const seen = new Map()
  for (const product of page.content) {
    if (!product.category) continue
    if (!seen.has(product.category)) {
      seen.set(product.category, { name: product.category, count: 0 })
    }
    seen.get(product.category).count += 1
  }
  return [...seen.values()]
}
