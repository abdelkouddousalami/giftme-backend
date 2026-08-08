import { apiClient } from '../lib/api.js'

export async function getPublicMemory(publicCode) {
  const { data } = await apiClient.get(`/api/memories/${publicCode}`)
  return data.data
}
