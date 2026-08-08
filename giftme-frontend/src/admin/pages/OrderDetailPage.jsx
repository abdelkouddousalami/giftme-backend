import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MapPin, Package, Phone, User } from 'lucide-react'
import { getOrder, getOrderTracking, updateOrderStatus } from '../api/orders.js'
import { ORDER_STATUSES, TERMINAL_STATUSES } from '../lib/constants.js'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Select, Textarea } from '../components/ui/Input.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { OrderStatusBadge, PaymentStatusBadge } from '../components/ui/Badge.jsx'
import { ErrorAlert } from '../components/ui/ErrorAlert.jsx'
import { formatCurrency, formatDateTime } from '../lib/format.js'
import { extractErrorMessage } from '../api/client.js'
import { resolveMediaUrl } from '../lib/media.js'
import { paths } from '../../app/paths.js'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = Number(id)

  const [order, setOrder] = useState(null)
  const [trackingEvents, setTrackingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [nextStatus, setNextStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const [orderData, trackingData] = await Promise.all([getOrder(orderId), getOrderTracking(orderId)])
      setOrder(orderData)
      setTrackingEvents(trackingData.trackingEvents)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Number.isFinite(orderId)) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  async function handleStatusUpdate() {
    if (!nextStatus) return
    setIsUpdating(true)
    setUpdateError(null)
    try {
      const updated = await updateOrderStatus(orderId, nextStatus, adminNote || undefined)
      const trackingData = await getOrderTracking(orderId)
      setOrder(updated)
      setTrackingEvents(trackingData.trackingEvents)
      setNextStatus('')
      setAdminNote('')
    } catch (err) {
      setUpdateError(extractErrorMessage(err))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (error || !order) {
    return <ErrorState message={error ?? 'Order not found.'} onRetry={load} />
  }

  const isTerminal = TERMINAL_STATUSES.includes(order.orderStatus)

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(paths.admin.orders)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back to orders
      </button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            Tracking code <span className="font-medium text-slate-700">{order.trackingCode}</span> · placed{' '}
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" />
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    {item.customization?.imageUrl ? (
                      <img
                        src={resolveMediaUrl(item.customization.imageUrl)}
                        alt=""
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{item.productName}</p>
                      <p className="font-medium text-slate-800">{formatCurrency(item.totalPrice)}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    {item.customization && (
                      <div className="mt-2 space-y-0.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                        {item.customization.recipientName && <p>For: {item.customization.recipientName}</p>}
                        {item.customization.occasion && <p>Occasion: {item.customization.occasion}</p>}
                        {item.customization.giftMessage && <p>Message: "{item.customization.giftMessage}"</p>}
                        {item.customization.qrMemoryEnabled && item.customization.memoryPublicCode && (
                          <p>
                            QR Memory:{' '}
                            <span className="font-medium text-black underline">{item.customization.memoryPublicCode}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <CardBody className="border-t border-slate-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Update status" />
            <CardBody className="space-y-3">
              {isTerminal ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  This order is <strong>{order.orderStatus}</strong>, a final state — its status can no longer be changed.
                </p>
              ) : (
                <>
                  {updateError && <ErrorAlert>{updateError}</ErrorAlert>}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Select
                      label="New status"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                      className="sm:w-56"
                    >
                      <option value="">Select a status…</option>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </Select>
                    <div className="flex-1">
                      <Textarea
                        label="Note (optional)"
                        rows={1}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Internal note about this change"
                      />
                    </div>
                  </div>
                  <Button icon={<Check size={16} />} isLoading={isUpdating} disabled={!nextStatus} onClick={handleStatusUpdate}>
                    Apply status change
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tracking timeline" />
            <CardBody>
              <ol className="space-y-4">
                {trackingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">No tracking events yet.</p>
                ) : (
                  [...trackingEvents]
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((event, idx, arr) => (
                      <li key={event.id} className="relative flex gap-3 pb-1 last:pb-0">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                              idx === arr.length - 1 ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Check size={13} />
                          </span>
                          {idx < arr.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-sm font-medium text-slate-800">{event.description}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
                        </div>
                      </li>
                    ))
                )}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-slate-700">
                <User size={15} className="text-slate-400" /> {order.customerName}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Phone size={15} className="text-slate-400" /> {order.phone}
              </p>
              {order.email && <p className="text-slate-500">{order.email}</p>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Delivery" />
            <CardBody className="space-y-2.5 text-sm">
              <p className="flex items-start gap-2 text-slate-700">
                <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <span>
                  {order.address}, {order.city}
                </span>
              </p>
              {order.notes && <p className="text-slate-500">Note: {order.notes}</p>}
              {order.estimatedDelivery && (
                <p className="text-slate-500">Estimated delivery: {formatDateTime(order.estimatedDelivery)}</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
