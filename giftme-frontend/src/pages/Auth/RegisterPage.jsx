import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import { TextField } from '../../components/ui/Field.jsx'
import { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { extractErrorMessage, isNetworkError } from '../../lib/api.js'
import { paths } from '../../app/paths.js'

/**
 * Create an account — `POST /api/auth/register` by way of useAuth().
 *
 * The limits below are RegisterRequest's own Bean Validation constraints,
 * mirrored client-side so a shopper is told about them while typing instead of
 * after a round trip. The backend still enforces every one of them; this is
 * courtesy, not trust.
 *
 * There is no role field in the request by design — public self-registration
 * always creates a CUSTOMER, so a crafted payload can never self-elevate to
 * ADMIN. Admin accounts are seeded server-side and never made here.
 */

const LIMITS = {
  fullName: 255,
  email: 255,
  phone: 30,
  passwordMin: 8,
  passwordMax: 100,
}

/**
 * Only ever used to catch an obvious typo before the request goes out — the
 * backend's `@Email` is the authority and re-checks every address regardless.
 *
 * One deliberate deviation from it: this insists on a dotted domain, which
 * Hibernate's `@Email` does not (it would accept `sam@localhost`). Nobody types
 * a dotless address into a storefront on purpose, so catching that here is
 * worth being marginally stricter than the server. Nothing else is judged.
 */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

function validate(form) {
  const errors = {}

  const fullName = form.fullName.trim()
  if (!fullName) errors.fullName = 'Please tell us your name.'
  else if (fullName.length > LIMITS.fullName)
    errors.fullName = `Keep this under ${LIMITS.fullName} characters.`

  const email = form.email.trim()
  if (!email) errors.email = 'An email is required.'
  else if (!LOOKS_LIKE_EMAIL.test(email)) errors.email = 'Enter a valid email address.'

  if (form.phone.trim().length > LIMITS.phone)
    errors.phone = `Phone numbers can be at most ${LIMITS.phone} characters.`

  if (!form.password) errors.password = 'Choose a password.'
  else if (form.password.length < LIMITS.passwordMin)
    errors.password = `Use at least ${LIMITS.passwordMin} characters.`
  else if (form.password.length > LIMITS.passwordMax)
    errors.password = `Passwords can be at most ${LIMITS.passwordMax} characters.`

  // Client-side only — `confirmPassword` is not part of RegisterRequest and is
  // never sent. It exists to catch a mistyped password, nothing more.
  if (form.password && form.confirmPassword !== form.password)
    errors.confirmPassword = 'These two passwords don’t match.'

  return errors
}

function RegisterPage() {
  const { isAuthenticated, register } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // The AuthResponse from /register already carries a session, so a successful
  // registration is a successful sign-in — there is nothing left to confirm.
  if (isAuthenticated) {
    return <Navigate to={paths.account} replace />
  }

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [field]: value }))
    // Clear a field's error as soon as it is touched; re-validated on submit.
    setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError(null)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        // api/auth.js turns an empty string into `undefined`, so an untouched
        // optional field is never stored as a blank phone number.
        phone: form.phone.trim(),
        password: form.password,
      })
      // No navigate() here — the isAuthenticated branch above owns the redirect.
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
        <div className="mx-auto max-w-[32rem]">
          <header className="flex flex-col items-start gap-4">
            <p className="eyebrow">Join GiftMe</p>
            <h1 className="[font-size:var(--text-display-2)]">
              Create your <em className="text-burgundy">account</em>
            </h1>
            <p className="text-ink-soft [font-size:var(--text-sm)]">
              Keep your details on file so the next gift takes a minute, not five.
            </p>
          </header>

          <div className="mt-8 flex gap-3.5 rounded-(--radius-lg) border border-line-strong bg-olive-tint px-5 py-4">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-olive-deep">
              <Icon name="gift" size={18} />
            </span>
            <p className="text-ink-soft [font-size:var(--text-sm)]">
              <span className="font-medium text-ink">This is optional.</span> You can order as a
              guest and pay cash on delivery — an account simply saves you the retyping.{' '}
              <Link to={paths.shop} className="font-medium text-burgundy underline underline-offset-4">
                Browse the gifts
              </Link>
              .
            </p>
          </div>

          {/* noValidate so our own field messages are the only ones shown. */}
          <form
            noValidate
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5 rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:p-7"
          >
            <ErrorNotice error={error} />

            <TextField
              label="Full name"
              name="fullName"
              autoComplete="name"
              required
              maxLength={LIMITS.fullName}
              value={form.fullName}
              onChange={update('fullName')}
              error={fieldErrors.fullName}
              disabled={submitting}
              placeholder="Yasmine El Amrani"
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              maxLength={LIMITS.email}
              value={form.email}
              onChange={update('email')}
              error={fieldErrors.email}
              hint="We use it to sign you in and to reach you about an order."
              disabled={submitting}
              placeholder="you@example.com"
            />

            <TextField
              label="Phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              maxLength={LIMITS.phone}
              value={form.phone}
              onChange={update('phone')}
              error={fieldErrors.phone}
              hint={`Optional — up to ${LIMITS.phone} characters. Helpful for delivery.`}
              disabled={submitting}
              placeholder="06 12 34 56 78"
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              maxLength={LIMITS.passwordMax}
              value={form.password}
              onChange={update('password')}
              error={fieldErrors.password}
              hint={`At least ${LIMITS.passwordMin} characters.`}
              disabled={submitting}
            />

            <TextField
              label="Confirm password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              maxLength={LIMITS.passwordMax}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={fieldErrors.confirmPassword}
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn--block mt-1"
              disabled={submitting}
            >
              {submitting ? 'Creating your account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-ink-soft [font-size:var(--text-sm)]">
            Already have an account?{' '}
            <Link to={paths.login} className="font-medium text-burgundy underline underline-offset-4">
              Sign in
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  )
}

export default RegisterPage
