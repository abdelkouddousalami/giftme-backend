import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { ShoppingCart, DollarSign, Users, Package, Clock } from 'lucide-react'
import { getDashboardStats, getOrdersChart, getTopProducts } from '../api/dashboard.js'
import { StatCard } from '../components/StatCard.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { formatCurrency, formatDate } from '../lib/format.js'
import { extractErrorMessage } from '../api/client.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ArcElement, BarElement, Tooltip)

const RANGE_OPTIONS = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 90, label: '90D' },
]

const METRIC_OPTIONS = [
  { value: 'orders', label: 'Orders' },
  { value: 'revenue', label: 'Revenue' },
]

// Grayscale progression matching the OrderStatusBadge palette, so a status reads the same
// shade everywhere in the admin. CANCELLED breaks the gradient on purpose (outlined, not
// filled) since it isn't part of the fulfillment pipeline.
const STATUS_BREAKDOWN = [
  { key: 'pendingOrders', label: 'Pending', color: '#f5f5f5', border: '#d4d4d4' },
  { key: 'confirmedOrders', label: 'Confirmed', color: '#d4d4d4', border: '#d4d4d4' },
  { key: 'preparingOrders', label: 'Preparing', color: '#a3a3a3', border: '#a3a3a3' },
  { key: 'shippedOrders', label: 'Shipped', color: '#525252', border: '#525252' },
  { key: 'deliveredOrders', label: 'Delivered', color: '#000000', border: '#000000' },
  { key: 'cancelledOrders', label: 'Cancelled', color: '#ffffff', border: '#000000' },
]

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [chart, setChart] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [rangeDays, setRangeDays] = useState(30)
  const [metric, setMetric] = useState('orders')
  const [isChartLoading, setIsChartLoading] = useState(false)

  async function loadChart(days) {
    setIsChartLoading(true)
    try {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - (days - 1))
      const chartData = await getOrdersChart(toISODate(from), toISODate(to))
      setChart(chartData)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsChartLoading(false)
    }
  }

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      const [statsData, topProductsData] = await Promise.all([getDashboardStats(), getTopProducts(5)])
      setStats(statsData)
      setTopProducts(topProductsData)
      await loadChart(rangeDays)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRangeChange(days) {
    setRangeDays(days)
    loadChart(days)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (error || !stats) {
    return <ErrorState message={error ?? 'Could not load dashboard data.'} onRetry={load} />
  }

  const avgOrderValue = stats.totalOrders > 0 ? Number(stats.totalRevenue) / stats.totalOrders : 0
  const knownStatusTotal = STATUS_BREAKDOWN.reduce((sum, s) => sum + (stats[s.key] ?? 0), 0)

  const lineData = {
    labels: chart.map((p) => formatDate(p.date)),
    datasets: [
      {
        data: chart.map((p) => (metric === 'orders' ? p.orderCount : Number(p.revenue))),
        borderColor: '#000000',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#000000',
        tension: 0.35,
        fill: true,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return 'rgba(0,0,0,0)'
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(0,0,0,0.12)')
          gradient.addColorStop(1, 'rgba(0,0,0,0)')
          return gradient
        },
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (item) => (metric === 'orders' ? `${item.formattedValue} orders` : formatCurrency(item.raw)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#a3a3a3', font: { size: 11 }, maxTicksLimit: 8, autoSkip: true },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: { color: '#a3a3a3', font: { size: 11 }, precision: metric === 'orders' ? 0 : 2 },
      },
    },
  }

  const doughnutData = {
    labels: STATUS_BREAKDOWN.map((s) => s.label),
    datasets: [
      {
        data: STATUS_BREAKDOWN.map((s) => stats[s.key] ?? 0),
        backgroundColor: STATUS_BREAKDOWN.map((s) => s.color),
        borderColor: STATUS_BREAKDOWN.map((s) => s.border),
        borderWidth: 1.5,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
      },
    },
  }

  const barData = {
    labels: topProducts.map((p) => p.productName),
    datasets: [
      {
        data: topProducts.map((p) => Number(p.totalRevenue)),
        backgroundColor: '#000000',
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  }

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (item) => formatCurrency(item.raw),
        },
      },
    },
    scales: {
      x: { grid: { color: '#f0f0f0' }, ticks: { color: '#a3a3a3', font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { color: '#171717', font: { size: 12 } } },
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-black">Dashboard</h1>
        <p className="text-sm text-neutral-500">Overview of orders, revenue and catalog performance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} tone="strong" />
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} tone="strong" />
        <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={DollarSign} tone="strong" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} tone="default" />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} tone="default" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} tone="default" />
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={ShoppingCart} tone="default" />
        <StatCard label="Today's Revenue" value={formatCurrency(stats.todayRevenue)} icon={DollarSign} tone="default" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={`Orders — trailing ${rangeDays} days`}
            action={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SegmentedControl options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
                <SegmentedControl options={RANGE_OPTIONS} value={rangeDays} onChange={handleRangeChange} />
              </div>
            }
          />
          <CardBody>
            {isChartLoading ? (
              <div className="flex h-[280px] items-center justify-center">
                <Spinner size={24} />
              </div>
            ) : chart.length === 0 ? (
              <EmptyState title="No orders yet" description="Orders will appear here once customers start checking out." />
            ) : (
              <div style={{ height: 280 }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Order status breakdown" />
          <CardBody className="space-y-4">
            {knownStatusTotal === 0 ? (
              <EmptyState title="No orders yet" description="Status breakdown appears once orders come in." />
            ) : (
              <>
                <div style={{ height: 160 }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
                <div className="space-y-2">
                  {STATUS_BREAKDOWN.map((s) => {
                    const value = stats[s.key] ?? 0
                    const pct = Math.round((value / knownStatusTotal) * 100)
                    return (
                      <div key={s.key} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-neutral-600">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: s.color, border: `1px solid ${s.border}` }}
                          />
                          {s.label}
                        </span>
                        <span className="font-medium text-black">
                          {value} <span className="text-neutral-400">({pct}%)</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Top products by revenue" />
        <CardBody>
          {topProducts.length === 0 ? (
            <EmptyState title="No sales yet" description="Best-selling products will show up here once orders come in." />
          ) : (
            <div style={{ height: Math.max(180, topProducts.length * 44) }}>
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </CardBody>
        {topProducts.length > 0 && (
          <div className="overflow-x-auto border-t border-neutral-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Units sold</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-black">{p.productName}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.totalQuantitySold}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            value === opt.value ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
