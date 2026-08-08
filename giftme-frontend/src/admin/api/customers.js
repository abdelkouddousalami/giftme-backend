import { apiClient } from './client.js'

export async function listCustomers(page = 0, size = 50) {
  const { data } = await apiClient.get('/api/admin/customers', {
    params: { page, size, sort: 'createdAt,desc' },
  })
  return data.data
}

export async function getCustomerOrders(id, page = 0, size = 20) {
  const { data } = await apiClient.get(`/api/admin/customers/${id}/orders`, {
    params: { page, size, sort: 'createdAt,desc' },
  })
  return data.data
}
