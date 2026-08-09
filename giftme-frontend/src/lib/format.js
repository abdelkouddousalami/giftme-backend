/**
 * Storefront formatters.
 *
 * Currency is Moroccan dirham: every price in the backend is a `NUMERIC(10,2)`
 * serialized as a JSON number, and the seeded catalog, the 30.00 delivery fee
 * and the 500.00 free-delivery threshold are all MAD. Formatting lives here so
 * no component invents its own.
 */

import i18n from '../i18n/index.js'

const AMOUNT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** `149` → `149.00 MAD`. Matches the admin section's formatCurrency. */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—'
  return `${AMOUNT.format(Number(amount))} MAD`
}

/** Compact variant for dense surfaces (cards, line items): `149 MAD`, `149.50 MAD`. */
export function formatPriceShort(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—'
  const value = Number(amount)
  const body = Number.isInteger(value) ? String(value) : AMOUNT.format(value)
  return `${body} MAD`
}

/** Bare `YYYY-MM-DD`, the shape a Java `LocalDate` serializes to. */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Formats an `Instant` (`2026-08-09T01:13:19Z`) or a `LocalDate` (`2026-08-14`).
 *
 * The two need different handling. `new Date("2026-08-14")` is specified to
 * parse as *UTC* midnight, so rendering it in local time shows the previous day
 * to every viewer west of Greenwich — which would quietly move the delivery
 * date GiftMe promised. A date-only value is therefore built from its parts, so
 * it stays the calendar day the backend actually sent. Timestamps keep their
 * normal local-time conversion, which for them is correct.
 */
export function formatDate(iso) {
  if (!iso) return '—'

  const parts = DATE_ONLY.exec(iso)
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(iso)

  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Customer-facing labels for `OrderStatus`.
 *
 * The admin section has its own map (`src/admin/lib/constants.js`) written for
 * an operator; these are written for the person waiting on the parcel. Both
 * read the same enum values from the backend.
 */
export const ORDER_STATUS_LABELS = {
  PENDING: 'Order received',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Being made',
  READY: 'Ready to ship',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

/** Keyed the same as ORDER_STATUS_LABELS, read through i18next so callers
 *  never see the English fallback while the catalogue above stays as
 *  documentation of what each backend enum value means. */
const ORDER_STATUS_KEYS = {
  PENDING: 'orderStatus.pending',
  CONFIRMED: 'orderStatus.confirmed',
  PREPARING: 'orderStatus.preparing',
  READY: 'orderStatus.ready',
  SHIPPED: 'orderStatus.shipped',
  OUT_FOR_DELIVERY: 'orderStatus.outForDelivery',
  DELIVERED: 'orderStatus.delivered',
  CANCELLED: 'orderStatus.cancelled',
}

/** The happy path, in order. CANCELLED is a side exit, not a stage. */
export const ORDER_PIPELINE = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export function orderStatusLabel(status) {
  const key = ORDER_STATUS_KEYS[status]
  return key ? i18n.t(key) : status
}
