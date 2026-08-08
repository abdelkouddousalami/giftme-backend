import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Gift } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorAlert } from '../components/ui/ErrorAlert.jsx'
import { extractErrorMessage } from '../api/client.js'
import { paths } from '../../app/paths.js'

export function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Single source of truth for the post-login redirect: once `user` is set, this fires on
  // the next render and sends the admin back to wherever RequireAuth intercepted them (or
  // the dashboard if they landed on /admin/login directly). Deliberately not *also* calling
  // navigate() imperatively from handleSubmit below - an earlier version did both, and the
  // two redirects raced, sometimes landing on a stale "from" location.
  if (user) {
    const from = location.state?.from?.pathname ?? paths.admin.dashboard
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both a username and password.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-90">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
            <Gift size={26} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-black">GiftMe Admin</h1>
            <p className="mt-1.5 text-[15px] text-neutral-500">Sign in to manage your store</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <ErrorAlert>{error}</ErrorAlert>}

          <input
            id="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-[15px] text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
          />

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-[15px] text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
          />

          <Button type="submit" className="w-full rounded-xl! py-3.5! text-[15px]" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-400">GiftMe · Admin console</p>
      </div>
    </div>
  )
}
