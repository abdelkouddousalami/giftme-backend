import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { tokenStorage } from '../lib/tokenStorage.js'

/**
 * Storefront session.
 *
 * Uses the backend's existing auth system unchanged — same `/api/auth/**`
 * endpoints the admin section calls, same JWT access token + rotating refresh
 * token. There is no second auth mechanism anywhere in the storefront.
 *
 * An account is entirely optional here: browsing, personalizing and checking
 * out all work signed out (guest COD is a first-class backend flow). Signing in
 * buys exactly two things the backend actually offers — a profile from
 * `GET /api/auth/me`, and orders linked to the user id when `POST /api/orders`
 * sees a CUSTOMER token.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Seed from storage so a reload doesn't flash the signed-out header before
  // /api/auth/me answers.
  const [user, setUser] = useState(() => tokenStorage.getUser())
  const [initializing, setInitializing] = useState(() => Boolean(tokenStorage.getAccessToken()))

  // Revalidate the stored session against the backend once on boot. The stored
  // user is a cache; the API is the truth.
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      setInitializing(false)
      return
    }

    let cancelled = false
    authApi
      .getCurrentUser()
      .then((current) => {
        if (cancelled) return
        setUser(current)
        tokenStorage.setUser(current)
      })
      .catch(() => {
        // 401 here means the access token expired *and* the refresh interceptor
        // could not rotate it — the session is genuinely over.
        if (cancelled) return
        tokenStorage.clear()
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const adoptSession = useCallback((authResponse) => {
    tokenStorage.setSession(authResponse.accessToken, authResponse.refreshToken, authResponse.user)
    setUser(authResponse.user)
    return authResponse.user
  }, [])

  const login = useCallback(
    async (credentials) => adoptSession(await authApi.login(credentials)),
    [adoptSession],
  )

  const register = useCallback(
    async (details) => adoptSession(await authApi.register(details)),
    [adoptSession],
  )

  /** Client-side only — the backend exposes no logout/revoke endpoint (see api/auth.js). */
  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
