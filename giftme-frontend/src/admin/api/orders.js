import { apiClient } from './client.js'

export async function searchOrders(params = {}) {
  const { status, ...rest } = params
  const { data } = await apiClient.get('/api/admin/orders', {
    params: { page: 0, size: 20, sort: 'createdAt,desc', ...rest, ...(status ? { status } : {}) },
  })
  return data.data
}

export async function getOrder(id) {
  const { data } = await apiClient.get(`/api/admin/orders/${id}`)
  return data.data
}

export async function updateOrderStatus(id, status, adminNote) {
  const { data } = await apiClient.patch(`/api/admin/orders/${id}/status`, {
    status,
    adminNote: adminNote || undefined,
  })
  return data.data
}

export async function getOrderTracking(id) {
  const { data } = await apiClient.get(`/api/admin/orders/${id}/tracking`)
  return data.data
}

export async function addTrackingEvent(id, status, description, adminNote) {
  const { data } = await apiClient.post(`/api/admin/orders/${id}/tracking-events`, {
    status,
    description,
    adminNote: adminNote || undefined,
  })
  return data.data
}
