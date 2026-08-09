/**
 * Orders placed from this browser.
 *
 * MISSING API: there is no customer-facing order list (`/api/admin/orders/**`
 * is ADMIN-only, and the public read path is code-based tracking). So instead
 * of inventing a history, we remember only what the backend just handed us
 * when the order was created — the order number and the tracking code — and
 * every screen that displays one of these re-reads its *live* state from
 * `GET /api/tracking/{trackingCode}`.
 *
 * Nothing here is a substitute for backend data: it is a list of capabilities
 * (tracking codes) this browser is entitled to look up. Status, totals and
 * dates always come from the API.
 *
 * Replace this with `GET /api/orders/me` if the backend ever gains it — that
 * would also make history survive a cleared browser or a second device.
 */

const KEY = 'giftme_order_history'
const MAX_ENTRIES = 25

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // Private mode / quota. History is a convenience, never a correctness
    // requirement — the tracking code is also printed on the confirmation page.
  }
}

/** @returns {Array<{orderNumber: string, trackingCode: string, placedAt: string}>} newest first */
export function getOrderHistory() {
  return read()
}

/** Records an order the backend just confirmed. Takes only what tracking needs. */
export function rememberOrder(order) {
  if (!order?.trackingCode) return
  const existing = read().filter((entry) => entry.trackingCode !== order.trackingCode)
  write([
    {
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      placedAt: order.createdAt ?? null,
    },
    ...existing,
  ])
}

export function forgetOrder(trackingCode) {
  write(read().filter((entry) => entry.trackingCode !== trackingCode))
}
