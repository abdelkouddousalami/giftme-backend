import axios from 'axios'
import { tokenStorage } from './tokenStorage.js'

/** Reaches the same backend as the admin section, with the storefront's own session. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

/**
 * Attach the customer's access token when there is one.
 *
 * Almost every storefront endpoint is `permitAll` on the backend (catalog,
 * tracking, memories, uploads, and order creation — guest checkout is
 * first-class). The header still matters for two things: `GET /api/auth/me`,
 * and `POST /api/orders`, where the backend links the order to the signed-in
 * CUSTOMER when a token is present (see OrderController).
 */
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Concurrent 401s while a refresh is already in flight all wait on the same
// promise instead of each firing their own /auth/refresh call (which would
// race and revoke each other's freshly-rotated refresh token). Same reasoning
// as the admin client — the backend rotates refresh tokens on every use.
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

      // Refresh failed — the session is gone. Unlike the admin client we do NOT
      // redirect: the storefront is usable signed-out, so dropping the tokens
      // and letting the caller surface the error is the correct behaviour.
      tokenStorage.clear()
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

/**
 * The machine-readable `code` from the error envelope (e.g. `PRODUCT_NOT_FOUND`,
 * `INSUFFICIENT_STOCK`). Lets a screen branch on the reason without matching
 * on message strings.
 */
export function extractErrorCode(error) {
  if (axios.isAxiosError(error)) return error.response?.data?.code ?? null
  return null
}

/** True when the request failed before the backend answered (server down, CORS, offline). */
export function isNetworkError(error) {
  return axios.isAxiosError(error) && !error.response
}
