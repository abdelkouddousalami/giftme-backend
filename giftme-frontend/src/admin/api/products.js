import { apiClient } from './client.js'

export async function listProducts(params = {}) {
  // /api/admin/products (not the public /api/products) - it includes inactive products,
  // which the admin screen needs to be able to see and reactivate.
  const { data } = await apiClient.get('/api/admin/products', {
    params: { page: 0, size: 50, ...params },
  })
  return data.data
}

export async function createProduct(request) {
  const { data } = await apiClient.post('/api/admin/products', request)
  return data.data
}

export async function updateProduct(id, request) {
  const { data } = await apiClient.put(`/api/admin/products/${id}`, request)
  return data.data
}

export async function deleteProduct(id) {
  await apiClient.delete(`/api/admin/products/${id}`)
}

export async function setProductStatus(id, active) {
  const { data } = await apiClient.patch(`/api/admin/products/${id}/status`, { active })
  return data.data
}
