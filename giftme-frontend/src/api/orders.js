import { apiClient } from '../lib/api.js'

/**
 * Order creation — `POST /api/orders` (OrderController).
 *
 * Public on purpose: guest cash-on-delivery checkout never requires an account.
 * When the shopper *is* signed in as a CUSTOMER the access token attached by
 * the api client makes the backend link the order to their user id.
 *
 * The request carries NO prices. `CreateOrderRequest` has no price field at
 * all — subtotal, delivery fee and total are computed server-side from the
 * current product rows (OrderServiceImpl), so anything the cart displays is a
 * preview that the backend re-derives authoritatively.
 */

/**
 * @param {object} request
 * @param {{name: string, phone: string, email?: string}} request.customer
 * @param {{city: string, address: string, notes?: string}} request.shipping
 * @param {Array<{productId: number, quantity: number, customization?: object}>} request.items
 * @param {'COD'} request.paymentMethod  the only PaymentMethod the backend accepts today
 * @returns {Promise<object>} OrderResponse — includes orderNumber, trackingCode and totals
 */
export async function createOrder(request) {
  const { data } = await apiClient.post('/api/orders', request)
  return data.data
}

/**
 * MISSING API — customer order history.
 *
 * There is no `GET /api/orders` (list) or `GET /api/orders/{id}` for a signed-in
 * customer; order reads exist only under `/api/admin/orders/**` (ADMIN-only) and
 * the public, code-based `GET /api/tracking/{trackingCode}`.
 *
 * Rather than fake a history, the storefront remembers the orders *this browser*
 * placed (see `src/lib/orderHistory.js`) and re-reads each one's live status from
 * the public tracking endpoint — real backend data, just keyed on something the
 * client is allowed to know. Add `GET /api/orders/me` backend-side for a true,
 * cross-device account history.
 */
