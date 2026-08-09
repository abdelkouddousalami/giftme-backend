import Button from '../common/Button.jsx'

/**
 * What a failed API call looks like.
 *
 * Never a blank screen and never a swallowed error: the backend's own message
 * (pulled off its `ApiResponse` error envelope) is shown verbatim, because it
 * is written for a human — "Product not found: 12", "Only 3 left in stock".
 * A network failure gets a different, honest headline: the server did not
 * answer at all, so there is nothing of its to quote.
 */
function ErrorState({
  error,
  onRetry,
  title,
  className = '',
  compact = false,
}) {
  const message = typeof error === 'string' ? error : error?.message
  const isNetwork = typeof error === 'object' && error?.isNetwork

  const heading =
    title ?? (isNetwork ? "We couldn't reach GiftMe" : 'Something went wrong')

  const detail = isNetwork
    ? 'The server did not respond. Check your connection and try again.'
    : (message ?? 'Please try again.')

  return (
    <div
      role="alert"
      className={[
        'flex flex-col items-center gap-4 rounded-(--radius-lg) border border-line-strong bg-white text-center',
        compact ? 'px-5 py-8' : 'px-6 py-14',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-(--radius-pill) bg-burgundy-tint text-burgundy"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M12 7.5v6" />
          <path d="M12 16.8h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[1.15rem]">{heading}</h2>
        <p className="max-w-[46ch] text-ink-soft [font-size:var(--text-sm)]">{detail}</p>
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Inline form-level error — for a submit that failed, where the surrounding
 * screen is still perfectly usable and must not be replaced.
 */
export function ErrorNotice({ error, className = '' }) {
  const message = typeof error === 'string' ? error : error?.message
  if (!message) return null

  // `border-blush` is a real token rather than `border-burgundy/30`: opacity
  // modifiers on the brand palette compile away in this app (see tailwind.css).
  return (
    <p
      role="alert"
      className={`rounded-(--radius-sm) border border-blush bg-burgundy-tint px-4 py-3 text-burgundy-deep [font-size:var(--text-sm)] ${className}`}
    >
      {message}
    </p>
  )
}

export default ErrorState
