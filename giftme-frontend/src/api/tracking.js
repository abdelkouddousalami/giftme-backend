import { apiClient } from '../lib/api.js'

/**
 * Public order tracking — `GET /api/tracking/{trackingCode}` (TrackingController).
 *
 * Fully public and code-only by design (business rule #5): there is no id-based
 * lookup and no authentication, so the tracking code is the capability. Codes
 * look like `GM-8X4K2Q`.
 *
 * Returns TrackingResponse: { orderNumber, trackingCode, currentStatus,
 * createdAt, estimatedDelivery, trackingEvents[] }.
 */
export async function trackOrder(trackingCode) {
  const { data } = await apiClient.get(`/api/tracking/${encodeURIComponent(trackingCode.trim())}`)
  return data.data
}
