import { useTranslation } from 'react-i18next'

/**
 * The single busy indicator.
 *
 * A thin rotating arc rather than a pulsing blob — it matches the hairline
 * vocabulary the rest of the page is drawn with. `role="status"` plus the
 * visually-hidden label means a screen reader announces the wait; sighted users
 * get the arc.
 */
function Spinner({ size = 20, label, className = '' }) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.loading')
  return (
    <span role="status" className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="motion-safe:animate-[spin_800ms_linear_infinite]"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{resolvedLabel}</span>
    </span>
  )
}

/** Full-section busy state — keeps the page from collapsing while data loads. */
export function LoadingBlock({ label, className = '' }) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.loading')
  return (
    <div
      className={`flex min-h-[16rem] flex-col items-center justify-center gap-4 text-ink-soft ${className}`}
    >
      <Spinner size={26} label={resolvedLabel} />
      <p className="[font-size:var(--text-sm)]">{resolvedLabel}…</p>
    </div>
  )
}

export default Spinner
