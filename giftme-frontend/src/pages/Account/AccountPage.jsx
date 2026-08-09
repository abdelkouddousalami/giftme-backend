import { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Badge, { statusTone } from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { trackOrder } from '../../api/tracking.js'
import { getOrderHistory } from '../../lib/orderHistory.js'
import { formatDate, formatDateTime, orderStatusLabel } from '../../lib/format.js'
import { paths } from '../../app/paths.js'

/**
 * The signed-in area: a profile the backend actually exposes, and the orders
 * this browser holds tracking codes for.
 *
 * Two honest limits shape this page, and both are stated in the UI rather than
 * papered over — profile fields are read-only, and the order list is
 * device-scoped. See the MISSING API notes at each section.
 */

const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  ADMIN: 'Administrator',
}

/**
 * One remembered order, resolved against the backend.
 *
 * Each card owns its own request, so a code that 404s (an order purged, a
 * mistyped entry from an older build) fails alone — the rest of the list still
 * renders. `orderNumber` and `placedAt` come from the OrderResponse the backend
 * returned when the order was created, so the card has something real to show
 * even while the live lookup is in flight or has failed.
 */
function OrderHistoryCard({ entry }) {
  const { data, error, loading, run } = useAsync(
    () => trackOrder(entry.trackingCode),
    [entry.trackingCode],
  )

  const orderNumber = data?.orderNumber ?? entry.orderNumber
  const placedAt = data?.createdAt ?? entry.placedAt

  return (
    <li className="rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
            Order
          </p>
          <p className="mt-1.5 font-display text-[1.15rem] text-ink">{orderNumber ?? '—'}</p>
        </div>

        {loading ? (
          <span className="flex items-center gap-2 text-ink-soft [font-size:var(--text-xs)]">
            <Spinner size={16} label="Checking status" />
            {/* Spinner already announces the wait via role="status"; this is the
                same words drawn for sighted users, so keep it out of the a11y tree. */}
            <span aria-hidden="true">Checking status…</span>
          </span>
        ) : data ? (
          <Badge tone={statusTone(data.currentStatus)}>{orderStatusLabel(data.currentStatus)}</Badge>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <ErrorNotice
            error={
              error.isNetwork
                ? "We couldn't reach GiftMe to check this order's status."
                : error.message
            }
            className="w-full"
          />
          <Button variant="quiet" size="sm" onClick={run}>
            Try again
          </Button>
        </div>
      ) : null}

      {/*
        Rendered even when the live lookup failed. Two of these three values
        (when it was placed, the code itself) come from what this browser
        recorded at checkout, not from the request that just failed — and the
        tracking code is precisely what a customer needs to quote to us when
        something is wrong. Only the live-only field falls back to a dash.

        Intrinsic tracks rather than a `sm:grid-cols-3` breakpoint: past `nav`
        the page itself splits into two columns, so this card is *narrower* at
        1000px than it is on a 768px tablet. A viewport breakpoint would read
        that backwards and force three columns into ~310px. auto-fit measures
        the space actually available, and being variant-free it also sidesteps
        the breakpoint-order dedupe entirely.
      */}
      <dl className="m-0 mt-5 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-6 gap-y-4 border-t border-line pt-5">
        <div>
          <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
            Placed
          </dt>
          {/* No preflight: <dd> keeps its 40px user-agent indent unless reset. */}
          <dd className="m-0 mt-1.5 text-ink [font-size:var(--text-sm)]">
            {placedAt ? formatDateTime(placedAt) : '—'}
          </dd>
        </div>

        <div>
          <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
            Estimated delivery
          </dt>
          <dd className="m-0 mt-1.5 text-ink [font-size:var(--text-sm)]">
            {data?.estimatedDelivery ? formatDate(data.estimatedDelivery) : '—'}
          </dd>
        </div>

        <div>
          <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
            Tracking code
          </dt>
          {/* A tracking code is one token the customer has to read back to
              us — the hyphen in `GM-8X4K2Q` is a legal break opportunity that
              would otherwise split it across two lines. */}
          <dd className="m-0 mt-1.5 font-medium whitespace-nowrap text-ink [font-size:var(--text-sm)]">
            {entry.trackingCode}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex border-t border-line pt-4">
        <Link
          to={paths.trackCode(entry.trackingCode)}
          className="inline-flex items-center gap-1.5 font-medium text-burgundy [font-size:var(--text-sm)]"
        >
          Follow this order
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>
    </li>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-line pb-4 last:border-b-0 last:pb-0">
      <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
        {label}
      </dt>
      <dd className="m-0 wrap-anywhere text-ink [font-size:var(--text-sm)]">{value}</dd>
    </div>
  )
}

function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth()

  // Read once per mount: localStorage is not reactive, and re-reading on every
  // render would hand each card a new object and restart its tracking request.
  //
  // Entries without a code are dropped rather than rendered: the tracking code
  // is both the React key and the entire request, so a single malformed entry
  // (a hand-edited store, or one written before rememberOrder guarded it) would
  // otherwise collide keys and surface a raw TypeError as the card's error
  // message. TrackPage filters the same list the same way.
  const [history] = useState(() => getOrderHistory().filter((entry) => entry.trackingCode))

  // The route is wrapped in <RequireAuth />, so this is a fallback for a
  // mis-wired route rather than the normal path — but it must never be a blank
  // screen.
  if (!isAuthenticated || !user) {
    return (
      <section className="py-(--section-y)">
        <Container size="narrow">
          <EmptyState
            icon="lock"
            title="You're signed out"
            description="Sign in to see your profile and the orders placed from this device."
            actionLabel="Sign in"
            actionTo={paths.login}
          />
        </Container>
      </section>
    )
  }

  const firstName = user.fullName?.trim().split(/\s+/)[0]

  return (
    <section className="py-(--section-y)">
      <Container>
        <header className="flex border-b border-line pb-8 max-sm:flex-col max-sm:items-start max-sm:gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="flex flex-col items-start gap-4">
            <p className="eyebrow">Your account</p>
            <h1 className="[font-size:var(--text-display-2)]">
              Hello, <em className="text-burgundy">{firstName || 'friend'}</em>
            </h1>
          </div>

          {/*
            Sign-out is client-side only: the backend has no revoke endpoint
            (refresh tokens are rotated, never invalidated on demand), so this
            drops the stored session and lets the access token die of its own
            15-minute expiry. Good enough for a personal device; a shared one
            would need POST /api/auth/logout on the backend.
          */}
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </header>

        {/* Range-disjoint gaps: a `nav:` utility loses to a base one that sets
            the same property, so the two never both match. */}
        <div className="mt-12 grid max-nav:gap-10 nav:grid-cols-[20rem_1fr] nav:gap-12">
          <section aria-labelledby="account-profile">
            <h2 id="account-profile" className="text-[1.35rem]">
              Your details
            </h2>

            <div className="mt-5 rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:p-6">
              {/*
                MISSING API: the profile is read-only because the backend has no
                customer-facing update endpoint — there is no PUT /api/auth/me
                and no /api/customers/{id} outside the ADMIN-only surface, which
                the storefront must never call. A PUT /api/auth/me accepting
                { fullName, phone } would be enough to turn this into a form.
              */}
              <dl className="m-0 flex flex-col gap-4">
                <ProfileRow label="Name" value={user.fullName} />
                <ProfileRow label="Email" value={user.email} />
                <ProfileRow
                  label="Phone"
                  value={
                    user.phone || (
                      <span className="text-ink-soft">Not on file</span>
                    )
                  }
                />
                <ProfileRow
                  label="Account type"
                  value={<Badge tone="ink">{ROLE_LABELS[user.role] ?? user.role}</Badge>}
                />
              </dl>

              <p className="mt-6 border-t border-line pt-5 text-ink-soft [font-size:var(--text-xs)]">
                Shown exactly as GiftMe has them. Editing isn&rsquo;t available yet — tell us when
                you place an order and we&rsquo;ll use the details you give at checkout.
              </p>
            </div>
          </section>

          <section aria-labelledby="account-orders">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <h2 id="account-orders" className="text-[1.35rem]">
                Your orders
              </h2>
              <Link
                to={paths.track}
                className="inline-flex items-center gap-1.5 font-medium text-burgundy [font-size:var(--text-sm)]"
              >
                Track any code
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            {/*
              MISSING API: there is no customer order history endpoint. The only
              public read path for an order is GET /api/tracking/{trackingCode},
              and /api/admin/orders/** is ADMIN-only, so a signed-in customer has
              no way to ask the backend "what have I ordered?".

              What this list is instead: the tracking codes this browser saved at
              checkout (src/lib/orderHistory.js), each resolved against the real
              tracking endpoint. Every status, date and estimate below is live
              backend data — only the *set* of orders is device-scoped, which is
              why the copy says so plainly.

              GET /api/orders/me (paged, filtered by the authenticated user)
              would replace this section entirely and make history survive a
              cleared browser or a second device.
            */}
            <p className="mt-4 max-w-[62ch] text-ink-soft [font-size:var(--text-sm)]">
              Orders you placed on this device. Statuses are checked with GiftMe as this page
              loads, so what you see is where your parcel actually is.
            </p>

            {history.length === 0 ? (
              <EmptyState
                className="mt-6"
                icon="box"
                title="Nothing here yet"
                description="Only orders placed from this browser show up here — we can't yet list orders across your devices. If you have a tracking code from an order confirmation, you can look it up any time."
                actionLabel="Track an order"
                actionTo={paths.track}
              />
            ) : (
              <ul className="mt-6 flex flex-col gap-5">
                {history.map((entry) => (
                  <OrderHistoryCard key={entry.trackingCode} entry={entry} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </section>
  )
}

export default AccountPage
