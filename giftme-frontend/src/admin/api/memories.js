import { apiClient } from './client.js'

export async function listMemories(page = 0, size = 50) {
  const { data } = await apiClient.get('/api/admin/memories', {
    params: { page, size, sort: 'createdAt,desc' },
  })
  return data.data
}

export async function createMemory(request) {
  const { data } = await apiClient.post('/api/admin/memories', request)
  return data.data
}

export async function updateMemory(id, request) {
  const { data } = await apiClient.put(`/api/admin/memories/${id}`, request)
  return data.data
}

export async function deleteMemory(id) {
  await apiClient.delete(`/api/admin/memories/${id}`)
}
