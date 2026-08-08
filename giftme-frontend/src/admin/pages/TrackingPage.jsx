import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GripVertical, MapPin } from 'lucide-react'
import { searchOrders, updateOrderStatus } from '../api/orders.js'
import { PIPELINE_ORDER, STATUS_LABELS, TERMINAL_STATUSES } from '../lib/constants.js'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorAlert } from '../components/ui/ErrorAlert.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { formatCurrency, formatRelativeTime } from '../lib/format.js'
import { extractErrorMessage } from '../api/client.js'
import { paths } from '../../app/paths.js'

const COLUMN_SIZE = 25
const BOARD_COLUMNS = [...PIPELINE_ORDER, 'CANCELLED']

// One color per status, so a column (and the cards inside it) reads at a glance - green for
// the reassuring stages, red for the one that exits the pipeline, warm colors as an order
// moves toward the customer's door.
const COLUMN_ACCENT = {
  PENDING: { dot: '#f59e0b', text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  CONFIRMED: { dot: '#22c55e', text: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  PREPARING: { dot: '#3b82f6', text: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  READY: { dot: '#8b5cf6', text: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  SHIPPED: { dot: '#06b6d4', text: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  OUT_FOR_DELIVERY: { dot: '#f97316', text: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  DELIVERED: { dot: '#059669', text: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  CANCELLED: { dot: '#ef4444', text: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
}

export function TrackingPage() {
  const navigate = useNavigate()
  const [columns, setColumns] = useState(() => Object.fromEntries(BOARD_COLUMNS.map((s) => [s, []])))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movingId, setMovingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const [draggedOrder, setDraggedOrder] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const [pendingCancel, setPendingCancel] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        BOARD_COLUMNS.map((status) => searchOrders({ status, size: COLUMN_SIZE, sort: 'createdAt,asc' })),
      )
      const next = {}
      BOARD_COLUMNS.forEach((status, idx) => {
        next[status] = results[idx].content
      })
      setColumns(next)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function moveOrder(order, targetStatus, note) {
    const sourceStatus = order.orderStatus
    setActionError(null)
    setMovingId(order.id)
    setColumns((prev) => ({
      ...prev,
      [sourceStatus]: prev[sourceStatus].filter((o) => o.id !== order.id),
      [targetStatus]: [{ ...order, orderStatus: targetStatus }, ...(prev[targetStatus] ?? [])],
    }))
    try {
      await updateOrderStatus(order.id, targetStatus, note)
    } catch (err) {
      setActionError(extractErrorMessage(err))
      load()
    } finally {
      setMovingId(null)
    }
  }

  function handleDragStart(e, order) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(order.id))
    setDraggedOrder(order)
  }

  function handleDragEnd() {
    setDraggedOrder(null)
    setDragOverStatus(null)
  }

  function handleColumnDragOver(e, status) {
    if (!draggedOrder || draggedOrder.orderStatus === status) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverStatus !== status) setDragOverStatus(status)
  }

  function handleColumnDragLeave(e, status) {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (dragOverStatus === status) setDragOverStatus(null)
  }

  function handleColumnDrop(e, targetStatus) {
    e.preventDefault()
    setDragOverStatus(null)
    const order = draggedOrder
    setDraggedOrder(null)
    if (!order || order.orderStatus === targetStatus) return

    if (targetStatus === 'CANCELLED') {
      setPendingCancel(order)
      return
    }
    moveOrder(order, targetStatus)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-black">Tracking</h1>
        <p className="text-sm text-neutral-500">Drag a card between columns to update its status — forward or back, any time.</p>
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}
      {actionError && <ErrorAlert>{actionError}</ErrorAlert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BOARD_COLUMNS.map((status) => (
          <TrackingColumn
            key={status}
            status={status}
            orders={columns[status] ?? []}
            movingId={movingId}
            isDragOver={dragOverStatus === status}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleColumnDragOver(e, status)}
            onDragLeave={(e) => handleColumnDragLeave(e, status)}
            onDrop={(e) => handleColumnDrop(e, status)}
            onOpen={(id) => navigate(paths.admin.orderDetail(id))}
          />
        ))}
      </div>

      {pendingCancel && (
        <ConfirmDialog
          title="Cancel order"
          message={`Cancel order ${pendingCancel.orderNumber}? This moves it out of the fulfillment pipeline.`}
          confirmLabel="Cancel order"
          danger
          isLoading={movingId === pendingCancel.id}
          onConfirm={async () => {
            await moveOrder(pendingCancel, 'CANCELLED', 'Cancelled via tracking board')
            setPendingCancel(null)
          }}
          onCancel={() => setPendingCancel(null)}
        />
      )}
    </div>
  )
}

function TrackingColumn({ status, orders, movingId, isDragOver, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onOpen }) {
  const accent = COLUMN_ACCENT[status]
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="flex flex-col overflow-hidden rounded-xl border transition-colors"
      style={
        isDragOver
          ? { borderColor: accent.dot, borderStyle: 'dashed', backgroundColor: accent.bg }
          : { borderColor: '#e5e5e5', backgroundColor: '#fafafa' }
      }
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: accent.bg }}>
        <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent.text }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent.dot }} />
          {STATUS_LABELS[status]}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: accent.border, color: accent.text }}
        >
          {orders.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: '22rem', minHeight: '5rem' }}>
        {orders.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-neutral-400">{isDragOver ? 'Drop here' : 'No orders'}</p>
        ) : (
          orders.map((order) => (
            <TrackingCard
              key={order.id}
              order={order}
              accent={accent}
              isMoving={movingId === order.id}
              onDragStart={(e) => onDragStart(e, order)}
              onDragEnd={onDragEnd}
              onOpen={() => onOpen(order.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function TrackingCard({ order, accent, isMoving, onDragStart, onDragEnd, onOpen }) {
  const isTerminal = TERMINAL_STATUSES.includes(order.orderStatus)

  return (
    <div
      draggable={!isTerminal && !isMoving}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={`group rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-all ${
        isMoving ? 'opacity-40' : isTerminal ? 'cursor-pointer' : 'cursor-grab hover:border-neutral-300 hover:shadow-md active:cursor-grabbing'
      }`}
      style={{ borderLeft: `3px solid ${accent.dot}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">{order.orderNumber}</p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">{order.customerName}</p>
        </div>
        {!isTerminal && (
          <GripVertical size={15} className="mt-0.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="flex items-center gap-1 text-xs text-neutral-400">
          <MapPin size={11} /> {order.city} · {formatRelativeTime(order.createdAt)}
        </p>
        <p className="text-sm font-medium text-black">{formatCurrency(order.total)}</p>
      </div>
    </div>
  )
}
