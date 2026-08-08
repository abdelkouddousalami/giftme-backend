import { apiClient } from './client.js'

export async function getDashboardStats() {
  const { data } = await apiClient.get('/api/admin/dashboard/stats')
  return data.data
}

export async function getOrdersChart(from, to) {
  const { data } = await apiClient.get('/api/admin/dashboard/orders-chart', { params: { from, to } })
  return data.data
}

export async function getTopProducts(limit = 5) {
  const { data } = await apiClient.get('/api/admin/dashboard/top-products', { params: { limit } })
  return data.data
}
