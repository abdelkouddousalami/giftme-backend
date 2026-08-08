import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search, ShoppingCart } from 'lucide-react'
import { searchOrders } from '../api/orders.js'
import { ORDER_STATUSES } from '../lib/constants.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Select } from '../components/ui/Input.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { OrderStatusBadge, PaymentStatusBadge } from '../components/ui/Badge.jsx'
import { formatCurrency, formatDateTime } from '../lib/format.js'
import { downloadCsv } from '../lib/csv.js'
import { extractErrorMessage } from '../api/client.js'
import { paths } from '../../app/paths.js'

export function OrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await searchOrders({ page, search: search || undefined, status })
      setOrders(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setPage(0)
    load()
  }

  function handleExportCsv() {
    downloadCsv('giftme-orders', orders, [
      { header: 'Order Number', accessor: (o) => o.orderNumber },
      { header: 'Tracking Code', accessor: (o) => o.trackingCode },
      { header: 'Customer', accessor: (o) => o.customerName },
      { header: 'Phone', accessor: (o) => o.phone },
      { header: 'City', accessor: (o) => o.city },
      { header: 'Items', accessor: (o) => o.itemCount },
      { header: 'Total', accessor: (o) => o.total },
      { header: 'Payment Status', accessor: (o) => o.paymentStatus },
      { header: 'Order Status', accessor: (o) => o.orderStatus },
      { header: 'Created', accessor: (o) => o.createdAt },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Search, filter and manage customer orders.</p>
        </div>
        <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportCsv} disabled={orders.length === 0}>
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order #, tracking code, customer name or phone…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setPage(0)
                setStatus(e.target.value)
              }}
              className="sm:w-48"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={40} />} title="No orders found" description="Try a different search or filter." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                      onClick={() => navigate(paths.admin.orderDetail(order.id))}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{order.trackingCode}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{order.customerName}</td>
                      <td className="px-5 py-3 text-slate-600">{order.phone}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-3">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
