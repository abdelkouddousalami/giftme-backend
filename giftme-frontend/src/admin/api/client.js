import axios from 'axios'
import { tokenStorage } from '../lib/tokenStorage.js'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Concurrent 401s while a refresh is already in flight all wait on the same
// promise instead of each firing their own /auth/refresh call (which would
// race and revoke each other's freshly-rotated refresh token).
let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
    const { accessToken, refreshToken: newRefreshToken } = response.data.data
    tokenStorage.setAccessToken(accessToken)
    tokenStorage.setRefreshToken(newRefreshToken)
    return accessToken
  } catch {
    tokenStorage.clear()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error.response?.status
    const isAuthEndpoint = config?.url?.includes('/api/auth/')

    if (status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise
      if (newToken) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${newToken}`
        return apiClient(config)
      }

      // Refresh failed - session is truly gone, send the user back to login.
      if (window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login')
      }
    }

    return Promise.reject(error)
  },
)

/** Pulls the human-readable message out of the backend's ApiResponse error envelope. */
export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
