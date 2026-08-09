import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import { TextField } from '../../components/ui/Field.jsx'
import { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { extractErrorMessage, isNetworkError } from '../../lib/api.js'
import { paths } from '../../app/paths.js'

/**
 * Sign in — `POST /api/auth/login` by way of useAuth().
 *
 * Signing in is a convenience, never a gate: guest COD checkout is the
 * backend's first-class path, so this page says so out loud instead of letting
 * a shopper assume they have to register to buy a gift.
 */

/** Where to land after a successful sign-in. RequireAuth stores a location object. */
function resolveRedirect(state) {
  const from = state?.from
  if (typeof from === 'string') return from
  if (from?.pathname) return `${from.pathname}${from.search ?? ''}`
  return paths.account
}

function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // One source of truth for the redirect: the moment the context has a user
  // this render returns <Navigate>. Doing it here rather than imperatively in
  // the submit handler avoids two redirects racing on the same navigation.
  if (isAuthenticated) {
    return <Navigate to={resolveRedirect(location.state)} replace />
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const email = form.email.trim()
    if (!email || !form.password) {
      setError('Enter your email and password to continue.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password: form.password })
      // No navigate() here — see the isAuthenticated branch above.
    } catch (err) {
      setError(
        isNetworkError(err)
          ? "We couldn't reach GiftMe. Check your connection and try again."
          : extractErrorMessage(err),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-(--section-y)">
      <Container size="narrow">
        <div className="mx-auto max-w-[30rem]">
          <header className="flex flex-col items-start gap-4">
            <p className="eyebrow">Welcome back</p>
            <h1 className="[font-size:var(--text-display-2)]">
              Sign in to <em className="text-burgundy">GiftMe</em>
            </h1>
            <p className="text-ink-soft [font-size:var(--text-sm)]">
              Your profile and the orders you have placed on this device, in one place.
            </p>
          </header>

          {/* The optional-account message, stated before the form rather than
              buried under it — a shopper should never fill this in believing
              it is the price of checking out. */}
          <div className="mt-8 flex gap-3.5 rounded-(--radius-lg) border border-line-strong bg-olive-tint px-5 py-4">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-olive-deep">
              <Icon name="gift" size={18} />
            </span>
            <p className="text-ink-soft [font-size:var(--text-sm)]">
              <span className="font-medium text-ink">You don&rsquo;t need an account to order.</span>{' '}
              Checkout works as a guest — pay cash on delivery and follow your parcel with the
              tracking code we send you.{' '}
              <Link to={paths.shop} className="font-medium text-burgundy underline underline-offset-4">
                Browse the gifts
              </Link>
              .
            </p>
          </div>

          {/* noValidate: the browser's native bubbles would pre-empt our own
              field errors, which are styled to match the rest of the form. */}
          <form
            noValidate
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5 rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:p-7"
          >
            <ErrorNotice error={error} />

            {/*
              type="text", not type="email", on purpose. The backend's
              LoginRequest is @NotBlank but deliberately NOT @Email-validated:
              the value is compared against `users.email` as an opaque string,
              which is how seeded accounts with a short login name sign in.
              Blocking a non-email identifier here would lock out a valid user
              the backend is perfectly happy to authenticate.
            */}
            <TextField
              label="Email"
              type="text"
              name="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              required
              value={form.email}
              onChange={update('email')}
              disabled={submitting}
              placeholder="you@example.com"
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={update('password')}
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn--block mt-1"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-ink-soft [font-size:var(--text-sm)]">
            New here?{' '}
            <Link to={paths.register} className="font-medium text-burgundy underline underline-offset-4">
              Create an account
            </Link>{' '}
            — it takes a minute.
          </p>
        </div>
      </Container>
    </section>
  )
}

export default LoginPage
