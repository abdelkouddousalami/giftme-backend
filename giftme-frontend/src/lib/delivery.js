/**
 * Delivery-fee *preview* only.
 *
 * MISSING API: the backend has no order-quote endpoint. `POST /api/orders` is
 * the only thing that prices an order, and it does so by creating it — which
 * means the authoritative `deliveryFee` / `total` only exist once the order is
 * already placed (OrderServiceImpl.calculateDeliveryFee).
 *
 * A cash-on-delivery shopper cannot reasonably be asked to confirm an order
 * without seeing what they will be asked to pay at the door, so the cart and
 * checkout show a preview computed from the two backend config values below.
 * Everything derived here is labelled "estimated" in the UI, and every screen
 * after checkout reads the real numbers off the OrderResponse instead.
 *
 * These constants mirror `giftme.order.*` in `application.yml`. They are the
 * one place in the storefront that restates a backend rule; if the backend
 * gains `POST /api/orders/quote`, delete this file and call it.
 */

/** `giftme.order.delivery-fee-default` */
export const DELIVERY_FEE = 30
/** `giftme.order.delivery-fee-free-threshold` */
export const FREE_DELIVERY_THRESHOLD = 500

/** @returns {number} the estimated delivery fee for a subtotal, in MAD. */
export function estimateDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}

/** How much more the shopper must spend to reach free delivery; 0 once they have. */
export function amountToFreeDelivery(subtotal) {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
}
