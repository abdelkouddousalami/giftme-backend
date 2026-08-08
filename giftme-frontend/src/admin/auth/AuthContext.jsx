import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { login as loginRequest } from '../api/auth.js'
import { tokenStorage } from '../lib/tokenStorage.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(tokenStorage.getUser())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const auth = await loginRequest(email, password)
    if (auth.user.role !== 'ADMIN') {
      throw new Error('This account does not have admin access.')
    }
    tokenStorage.setSession(auth.accessToken, auth.refreshToken, auth.user)
    setUser(auth.user)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
