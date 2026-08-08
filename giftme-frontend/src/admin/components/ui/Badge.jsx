// Monochrome only, by design: instead of a color per status, each stage gets a shade of
// gray that darkens as the order moves further along the pipeline - so "further along"
// reads visually as "darker", with no color vocabulary needed. CANCELLED/FAILED break the
// pattern on purpose (outlined + strikethrough) since they're not part of the progression.
const ORDER_STATUS_STYLES = {
  PENDING: 'bg-neutral-100 text-neutral-500',
  CONFIRMED: 'bg-neutral-200 text-neutral-700',
  PREPARING: 'bg-neutral-300 text-neutral-800',
  READY: 'bg-neutral-400 text-white',
  SHIPPED: 'bg-neutral-700 text-white',
  OUT_FOR_DELIVERY: 'bg-neutral-800 text-white',
  DELIVERED: 'bg-black text-white',
  CANCELLED: 'bg-white text-neutral-400 border border-neutral-300 line-through',
}

const PAYMENT_STATUS_STYLES = {
  PENDING: 'bg-neutral-100 text-neutral-500',
  CONFIRMED: 'bg-neutral-300 text-neutral-800',
  PAID: 'bg-black text-white',
  FAILED: 'bg-white text-neutral-400 border border-neutral-300 line-through',
}

export function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[status]}`}>
      {status.replaceAll('_', ' ')}
    </span>
  )
}

export function PaymentStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}

export function Badge({ children, tone = 'default' }) {
  const styles = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-black text-white',
    danger: 'bg-white text-neutral-400 border border-neutral-300 line-through',
    warning: 'bg-neutral-300 text-neutral-900',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{children}</span>
}
