import { apiClient } from './client.js'

export async function login(email, password) {
  const { data } = await apiClient.post('/api/auth/login', { email, password })
  return data.data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/api/auth/me')
  return data.data
}
