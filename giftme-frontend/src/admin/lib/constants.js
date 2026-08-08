export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]

export const TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED']

// Column order for the Tracking board. CANCELLED is appended separately by TrackingPage
// (dropped onto like any other column, via drag-and-drop) since it's a side-exit from the
// pipeline rather than a stage within it.
export const PIPELINE_ORDER = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Packing',
  READY: 'Ready to ship',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'On the way to your city',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}
