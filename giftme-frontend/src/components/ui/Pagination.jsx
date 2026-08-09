import { useTranslation } from 'react-i18next'
import Icon from '../common/Icon.jsx'

/**
 * Pager over a backend `PagedResponse`.
 *
 * Reads `page` / `totalPages` / `first` / `last` straight off the envelope —
 * the backend already knows where the edges are, so nothing here recomputes
 * them. Pages are zero-based in the API and one-based on screen.
 */
function Pagination({ page, totalPages, first, last, onChange, className = '' }) {
  const { t } = useTranslation()
  if (!totalPages || totalPages <= 1) return null

  const numbers = pageWindow(page, totalPages)

  return (
    <nav aria-label={t('ui.pagination')} className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={first}
        aria-label={t('ui.previousPage')}
        className="flex size-9 items-center justify-center rounded-(--radius-sm) border border-line-strong text-ink transition-colors duration-200 hover:border-ink disabled:cursor-not-allowed disabled:border-line disabled:text-ink-soft"
      >
        <Icon name="chevronRight" size={16} className="rotate-180 rtl:rotate-0" />
      </button>

      <ul className="flex items-center gap-1.5">
        {numbers.map((entry, index) =>
          entry === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-soft">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onChange(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={[
                  'flex size-9 items-center justify-center rounded-(--radius-sm) border transition-colors duration-200 [font-size:var(--text-sm)]',
                  entry === page
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line-strong text-ink hover:border-ink',
                ].join(' ')}
              >
                {entry + 1}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={last}
        aria-label={t('ui.nextPage')}
        className="flex size-9 items-center justify-center rounded-(--radius-sm) border border-line-strong text-ink transition-colors duration-200 hover:border-ink disabled:cursor-not-allowed disabled:border-line disabled:text-ink-soft"
      >
        <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
      </button>
    </nav>
  )
}

/** First, last, and a window around the current page; `null` marks an ellipsis. */
function pageWindow(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)

  const pages = new Set([0, totalPages - 1, page])
  if (page - 1 > 0) pages.add(page - 1)
  if (page + 1 < totalPages - 1) pages.add(page + 1)

  const sorted = [...pages].sort((a, b) => a - b)
  const withGaps = []
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) withGaps.push(null)
    withGaps.push(value)
  })
  return withGaps
}

export default Pagination
