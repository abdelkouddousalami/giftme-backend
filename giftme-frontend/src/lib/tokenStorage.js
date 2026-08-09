/**
 * Storefront session storage.
 *
 * Deliberately separate keys from `src/admin/lib/tokenStorage.js`: an admin
 * signed into /admin and a customer signed into the storefront are two
 * different backend accounts (ADMIN vs CUSTOMER roles), and sharing one key
 * would let one session silently overwrite the other's tokens in the same
 * browser.
 */

const ACCESS_TOKEN_KEY = 'giftme_access_token'
const REFRESH_TOKEN_KEY = 'giftme_refresh_token'
const USER_KEY = 'giftme_user'

function readJson(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  getUser() {
    return readJson(USER_KEY)
  },
  setSession(accessToken, refreshToken, user) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  setAccessToken(accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },
  setRefreshToken(refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
