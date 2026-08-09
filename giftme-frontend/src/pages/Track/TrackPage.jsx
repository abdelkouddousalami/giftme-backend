import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import Container from '../../components/common/Container.jsx'
import Icon from '../../components/common/Icon.jsx'
import SectionHeading from '../../components/common/SectionHeading.jsx'
import Badge, { statusTone } from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState, { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import { TextField } from '../../components/ui/Field.jsx'
import { LoadingBlock } from '../../components/ui/Spinner.jsx'
import { trackOrder } from '../../api/tracking.js'
import { useAsync } from '../../hooks/useAsync.js'
import { ORDER_PIPELINE, formatDate, formatDateTime, orderStatusLabel } from '../../lib/format.js'
import { getOrderHistory } from '../../lib/orderHistory.js'

/**
 * Track order — `GET /api/tracking/{trackingCode}` and nothing else.
 *
 * The endpoint is public and code-only by design (TrackingController is
 * `permitAll`): the code *is* the capability, so there is no id lookup and no
 * session involved. That also decides what this page may show. TrackingResponse
 * carries the order number, the code, the current status, two dates and the
 * event log — no customer, no address, no items, no totals — because anyone
 * holding the code can open this page. Everything rendered below is a field of
 * that response.
 *
 * `?code=` in the URL is the source of truth for what is being looked up, so a
 * result is refreshable, shareable, and reachable straight from the order
 * confirmation and the account page via `paths.trackCode()`.
 */

/**
 * Codes are minted uppercase as `GM-` + six characters (RandomCodeGenerator),
 * so case and stray whitespace are ours to fix silently. Nothing more is
 * checked here on purpose: the backend decides what a real code is, and a
 * client-side format rule could only ever reject one.
 */
function normalizeCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

/**
 * Oldest → newest. `id` breaks ties and covers an unparseable timestamp, since
 * the backend hands ids out in insertion order.
 */
function sortEvents(events) {
  return [...(events ?? [])].sort((a, b) => {
    const at = Date.parse(a?.createdAt)
    const bt = Date.parse(b?.createdAt)
    if (!Number.isNaN(at) && !Number.isNaN(bt) && at !== bt) return at - bt
    return (a?.id ?? 0) - (b?.id ?? 0)
  })
}

/**
 * The happy path as a filled bar. CANCELLED never reaches this component — it
 * is not a stage of ORDER_PIPELINE but an exit from it, so it gets its own
 * terminal panel instead of being faked into the sequence.
 */
function PipelineProgress({ currentStatus }) {
  const currentIndex = ORDER_PIPELINE.indexOf(currentStatus)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
        <p className="font-display text-[1.15rem]">{orderStatusLabel(currentStatus)}</p>
        {currentIndex >= 0 ? (
          <p className="text-ink-soft [font-size:var(--text-xs)]">
            Stage {currentIndex + 1} of {ORDER_PIPELINE.length}
          </p>
        ) : null}
      </div>

      <ol className="mt-4 grid grid-cols-7 gap-1.5">
        {ORDER_PIPELINE.map((status, index) => {
          const reached = currentIndex >= 0 && index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <li
              key={status}
              className="flex flex-col gap-2"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                aria-hidden="true"
                className={`h-1 rounded-(--radius-pill) ${reached ? 'bg-burgundy' : 'bg-sand'}`}
              />
              {/* Seven labels do not fit under a phone, so below `sm` they lose
                  their ink but keep their place in the accessibility tree —
                  `hidden` would leave a screen reader with a list of seven
                  empty items and no sequence to read. */}
              <span
                className={[
                  'text-[0.625rem] leading-tight tracking-[0.06em] uppercase max-sm:sr-only sm:block',
                  isCurrent ? 'font-medium text-burgundy' : reached ? 'text-ink' : 'text-ink-soft',
                ].join(' ')}
              >
                {orderStatusLabel(status)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The side exit. Deliberately not a stage, and deliberately not alarm-red. */
function CancelledNotice() {
  return (
    <div className="flex gap-3.5 rounded-(--radius-md) border border-blush bg-white px-4 py-4 max-sm:flex-col max-sm:items-start sm:items-center">
      <Badge tone={statusTone('CANCELLED')} className="shrink-0">
        {orderStatusLabel('CANCELLED')}
      </Badge>
      <p className="text-ink-soft [font-size:var(--text-sm)]">
        This order left the fulfilment pipeline and is not on its way. The timeline below is the
        full record of what happened — if that is unexpected, get in touch with the order number.
      </p>
    </div>
  )
}

function DetailCell({ label, children }) {
  return (
    <div>
      <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
        {label}
      </dt>
      <dd className="m-0 mt-1.5 [font-size:var(--text-sm)]">{children}</dd>
    </div>
  )
}

function TrackingResult({ tracking, onRefresh, refreshing, refreshError }) {
  const { orderNumber, trackingCode, currentStatus, createdAt, estimatedDelivery } = tracking
  const events = sortEvents(tracking.trackingEvents)
  const latest = events.at(-1) ?? null
  const cancelled = currentStatus === 'CANCELLED'

  return (
    <div className="flex flex-col gap-6">
      {/* A re-read that failed. The order below is still what the backend said a
          moment ago, so it stays on screen and the failure is reported next to
          it rather than replacing it. */}
      <ErrorNotice error={refreshError} />

      <div className="overflow-hidden rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs)">
        <div className="flex flex-wrap gap-x-6 gap-y-4 border-b border-line max-sm:flex-col max-sm:p-5 sm:items-start sm:justify-between sm:px-7 sm:py-6">
          <div>
            <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
              Order
            </p>
            <h2 className="mt-1.5 text-[1.35rem]">{orderNumber}</h2>
            <p className="mt-1 text-ink-soft [font-size:var(--text-xs)]">
              Placed {formatDateTime(createdAt)}
            </p>
          </div>

          <div className="flex flex-col gap-2 max-sm:items-start sm:items-end">
            <Badge tone={statusTone(currentStatus)}>{orderStatusLabel(currentStatus)}</Badge>
            <p className="text-ink-soft [font-size:var(--text-xs)]">
              Code <span className="font-medium tracking-[0.12em] text-ink">{trackingCode}</span>
            </p>
          </div>
        </div>

        <div className="border-b border-line max-sm:px-5 max-sm:py-6 sm:px-7 sm:py-6">
          {cancelled ? <CancelledNotice /> : <PipelineProgress currentStatus={currentStatus} />}
        </div>

        {/* No preflight: <dl> keeps its user-agent block margins unless reset. */}
        <dl className="m-0 grid gap-5 max-sm:px-5 max-sm:py-6 sm:grid-cols-2 sm:px-7 sm:py-6">
          <DetailCell label="Estimated delivery">
            {cancelled ? (
              <span className="text-ink-soft">Not applicable — this order was cancelled</span>
            ) : (
              formatDate(estimatedDelivery)
            )}
          </DetailCell>
          <DetailCell label="Last update">
            {latest ? formatDateTime(latest.createdAt) : <span className="text-ink-soft">—</span>}
          </DetailCell>
        </dl>
      </div>

      <section
        aria-labelledby="tracking-timeline-heading"
        className="rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:px-7 sm:py-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
          <h2 id="tracking-timeline-heading" className="text-[1.15rem]">
            Journey so far
          </h2>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {events.length === 0 ? (
          <p className="mt-4 text-ink-soft [font-size:var(--text-sm)]">
            No updates have been recorded against this order yet. It is in the queue — check back a
            little later.
          </p>
        ) : (
          <ol className="mt-6 flex flex-col">
            {events.map((event, index) => {
              const isLatest = index === events.length - 1

              return (
                <li
                  key={event.id ?? `${event.status}-${event.createdAt}-${index}`}
                  className="flex gap-4"
                  aria-current={isLatest ? 'step' : undefined}
                >
                  <div className="flex w-2.5 shrink-0 flex-col items-center">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-2.5 shrink-0 rounded-(--radius-pill) ${
                        isLatest ? 'bg-burgundy' : 'border border-line-strong bg-sand'
                      }`}
                    />
                    {!isLatest ? (
                      <span aria-hidden="true" className="w-px flex-1 bg-line-strong" />
                    ) : null}
                  </div>

                  <div className={isLatest ? 'pb-0' : 'pb-7'}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p
                        className={`[font-size:var(--text-sm)] ${
                          isLatest ? 'font-medium text-ink' : 'text-ink'
                        }`}
                      >
                        {orderStatusLabel(event.status)}
                      </p>
                      {isLatest ? <Badge tone="ink">Where it is now</Badge> : null}
                    </div>

                    {event.description ? (
                      <p className="mt-1.5 text-ink-soft [font-size:var(--text-sm)]">
                        {event.description}
                      </p>
                    ) : null}

                    <time
                      dateTime={event.createdAt ?? undefined}
                      className="mt-1.5 block text-ink-soft [font-size:var(--text-xs)]"
                    >
                      {formatDateTime(event.createdAt)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <p className="text-center text-ink-soft [font-size:var(--text-xs)]">
        Tracking is public and code-only, so this page shows progress and dates but never the
        address, the items or the amount. Anyone you share the code with sees exactly what you see
        here.
      </p>
    </div>
  )
}

/**
 * A 404 from this endpoint is the ordinary outcome of one mistyped character —
 * not a failure of the site — so it reads as a correction, not an alarm, and
 * never borrows <ErrorState />'s alert styling.
 */
function CodeNotFound({ code, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-(--radius-lg) border border-dashed border-line-strong bg-white px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-(--radius-pill) border border-line-strong text-ink-soft"
      >
        <Icon name="search" size={22} />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="text-[1.15rem]">We couldn&rsquo;t find an order with that code</h2>
        <p className="max-w-[48ch] text-ink-soft [font-size:var(--text-sm)]">
          Nothing matches{' '}
          <span className="font-medium tracking-[0.12em] text-ink">{code}</span>. A code is GM-
          followed by six characters, like GM-8X4K2Q, and it never contains 0, O, 1, I or L — those
          are left out precisely because they are easy to misread. Check it against your order
          confirmation and try again.
        </p>
      </div>

      <Button variant="quiet" size="sm" onClick={onEdit}>
        Edit the code
      </Button>
    </div>
  )
}

/**
 * One lookup of one code.
 *
 * Mounted under a key that contains the code, so a different code gets a
 * genuinely new component rather than a reused one — there is no render, not
 * even a single frame, in which the previous order's number could sit under the
 * new code. Nothing here is shared with the form above it.
 */
function TrackLookup({ code, onEditCode }) {
  const { data, error, loading, run } = useAsync(() => trackOrder(code), [code])

  // Only a failure with nothing to show takes over the surface. Once an order
  // has loaded, a later failure is a failed refresh, and <TrackingResult />
  // reports it inline instead of throwing away a result the reader was using.
  if (error && !loading && !data) {
    // A 404 is the ordinary result of one mistyped character, so it is handled
    // as its own outcome instead of falling through to the failure state.
    return error.status === 404 ? (
      <CodeNotFound code={code} onEdit={onEditCode} />
    ) : (
      <ErrorState error={error} onRetry={run} title="We couldn't check on that order" />
    )
  }

  if (!data) return <LoadingBlock label="Looking up your order" />

  return (
    <>
      <p role="status" className="sr-only">
        {`Order ${data.orderNumber} is ${orderStatusLabel(data.currentStatus)}.`}
      </p>
      <TrackingResult
        tracking={data}
        onRefresh={run}
        refreshing={loading}
        refreshError={error}
      />
    </>
  )
}

function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCode = normalizeCode(searchParams.get('code'))

  const [codeInput, setCodeInput] = useState(activeCode)
  const [formError, setFormError] = useState(null)
  // Bumped on every explicit lookup so that re-submitting the code already in
  // the URL still re-reads the order — status changes while the page is open.
  const [attempt, setAttempt] = useState(0)
  const inputRef = useRef(null)

  // MISSING API: there is no customer order-history endpoint. The only public
  // read path for an order is GET /api/tracking/{trackingCode}, and
  // /api/admin/orders/** is ADMIN-only, so nothing can answer "what have I
  // ordered?" — not even for a signed-in customer. What follows is therefore
  // the list of tracking codes this browser saved at checkout
  // (src/lib/orderHistory.js): a set of codes to look up, never a source of
  // order data. Read once, so the list cannot shuffle under the pointer.
  const [history] = useState(() => getOrderHistory().filter((entry) => entry.trackingCode))

  // Back/forward navigation changes the URL without touching the field.
  useEffect(() => {
    setCodeInput(activeCode)
  }, [activeCode])

  function focusInput() {
    inputRef.current?.focus()
    inputRef.current?.select()
  }

  /** The URL is what gets looked up, so every result is shareable and refreshable. */
  function lookUp(rawCode) {
    const next = normalizeCode(rawCode)
    setCodeInput(next)

    if (!next) {
      setFormError('Enter the tracking code from your order confirmation.')
      focusInput()
      return
    }

    setFormError(null)
    setAttempt((count) => count + 1)
    if (next !== activeCode) setSearchParams({ code: next })
  }

  function handleSubmit(event) {
    event.preventDefault()
    lookUp(codeInput)
  }

  return (
    <section className="py-(--section-y)">
      <Container size="narrow">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Order tracking"
          title={
            <>
              Where is <em>your gift?</em>
            </>
          }
          description="Enter the code from your order confirmation. No account, no password — the code is the key, and it works from any device."
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-9 rounded-(--radius-lg) border border-line-strong bg-white shadow-(--shadow-xs) max-sm:p-5 sm:p-7"
        >
          <div className="flex gap-4 max-sm:flex-col sm:items-end">
            <TextField
              ref={inputRef}
              className="flex-1"
              label="Tracking code"
              name="code"
              value={codeInput}
              onChange={(event) => {
                setCodeInput(event.target.value.toUpperCase())
                if (formError) setFormError(null)
              }}
              placeholder="GM-8X4K2Q"
              hint="Printed on your order confirmation. Upper or lower case both work."
              error={formError}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={40}
            />

            <Button type="submit" variant="primary" size="md">
              Track order
            </Button>
          </div>

          {history.length > 0 ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
                Orders placed on this device
              </p>

              <ul className="mt-3 flex flex-wrap gap-2">
                {history.map((entry) => {
                  const isActive = normalizeCode(entry.trackingCode) === activeCode

                  return (
                    <li key={entry.trackingCode}>
                      <button
                        type="button"
                        onClick={() => lookUp(entry.trackingCode)}
                        aria-pressed={isActive}
                        className={[
                          'inline-flex items-center gap-2.5 rounded-(--radius-pill) border px-3.5 py-1.5 transition-colors duration-200 [font-size:var(--text-xs)]',
                          isActive
                            ? 'border-burgundy bg-burgundy-tint text-burgundy-deep'
                            : 'border-line-strong bg-ivory text-ink hover:border-ink',
                        ].join(' ')}
                      >
                        <span className="font-medium tracking-[0.12em]">{entry.trackingCode}</span>
                        {entry.orderNumber ? (
                          <span className="text-ink-soft">{entry.orderNumber}</span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <p className="mt-3 text-ink-soft [font-size:var(--text-xs)]">
                This shortlist lives in this browser only — we have no way to look your orders up by
                name, phone or email. On another device, use the code itself.
              </p>
            </div>
          ) : null}
        </form>

        <div className="mt-10">
          {activeCode ? (
            <TrackLookup key={`${activeCode}#${attempt}`} code={activeCode} onEditCode={focusInput} />
          ) : (
            <EmptyState
              icon="truck"
              title="Ready when you are"
              description="Drop your code in above and we'll show you exactly where things stand — from the moment we start making your gift to the knock on the door."
              actionLabel="Enter a code"
              onAction={focusInput}
            />
          )}
        </div>
      </Container>
    </section>
  )
}

export default TrackPage
