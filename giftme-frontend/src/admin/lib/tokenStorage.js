const ACCESS_TOKEN_KEY = 'giftme_admin_access_token'
const REFRESH_TOKEN_KEY = 'giftme_admin_refresh_token'
const USER_KEY = 'giftme_admin_user'

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
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
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
