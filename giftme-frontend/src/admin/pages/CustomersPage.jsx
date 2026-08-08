import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Download, Users } from 'lucide-react'
import { getCustomerOrders, listCustomers } from '../api/customers.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { OrderStatusBadge } from '../components/ui/Badge.jsx'
import { formatCurrency, formatDate, formatDateTime } from '../lib/format.js'
import { downloadCsv } from '../lib/csv.js'
import { extractErrorMessage } from '../api/client.js'

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listCustomers(page)
      setCustomers(result.content)
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
  }, [page])

  function handleExportCsv() {
    downloadCsv('giftme-customers', customers, [
      { header: 'ID', accessor: (c) => c.id },
      { header: 'Name', accessor: (c) => c.name },
      { header: 'Phone', accessor: (c) => c.phone },
      { header: 'Email', accessor: (c) => c.email ?? '' },
      { header: 'Total Orders', accessor: (c) => c.totalOrders },
      { header: 'Total Spent', accessor: (c) => c.totalSpent },
      { header: 'Customer Since', accessor: (c) => c.createdAt },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Deduplicated by phone number. Click a row to see their orders.</p>
        </div>
        <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportCsv} disabled={customers.length === 0}>
          Export CSV
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : customers.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No customers yet" description="Customers appear here after their first order." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="w-8 px-3 py-3" />
                    <th className="px-2 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Orders</th>
                    <th className="px-5 py-3 font-medium">Total spent</th>
                    <th className="px-5 py-3 font-medium">Customer since</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      expanded={expandedId === customer.id}
                      onToggle={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                    />
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

function CustomerRow({ customer, expanded, onToggle }) {
  const [orders, setOrders] = useState(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)

  useEffect(() => {
    if (expanded && orders === null) {
      setIsLoadingOrders(true)
      getCustomerOrders(customer.id)
        .then((res) => setOrders(res.content))
        .catch((err) => setOrdersError(extractErrorMessage(err)))
        .finally(() => setIsLoadingOrders(false))
    }
  }, [expanded, orders, customer.id])

  return (
    <>
      <tr className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50" onClick={onToggle}>
        <td className="px-3 py-3 text-slate-400">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
        <td className="px-2 py-3 font-medium text-slate-800">{customer.name}</td>
        <td className="px-5 py-3 text-slate-600">{customer.phone}</td>
        <td className="px-5 py-3 text-slate-500">{customer.email ?? '—'}</td>
        <td className="px-5 py-3 text-slate-600">{customer.totalOrders}</td>
        <td className="px-5 py-3 font-medium text-slate-800">{formatCurrency(customer.totalSpent)}</td>
        <td className="px-5 py-3 text-slate-500">{formatDate(customer.createdAt)}</td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={7} className="px-5 py-3">
            {isLoadingOrders ? (
              <div className="flex justify-center py-3">
                <Spinner size={20} />
              </div>
            ) : ordersError ? (
              <p className="py-2 text-sm font-medium text-black">{ordersError}</p>
            ) : orders && orders.length === 0 ? (
              <p className="py-2 text-sm text-slate-500">No orders found.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-1.5 pr-4 font-medium">Order</th>
                    <th className="py-1.5 pr-4 font-medium">Total</th>
                    <th className="py-1.5 pr-4 font-medium">Status</th>
                    <th className="py-1.5 pr-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="py-1.5 pr-4 font-medium text-slate-700">{order.orderNumber}</td>
                      <td className="py-1.5 pr-4 text-slate-600">{formatCurrency(order.total)}</td>
                      <td className="py-1.5 pr-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="py-1.5 pr-4 text-slate-500">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
