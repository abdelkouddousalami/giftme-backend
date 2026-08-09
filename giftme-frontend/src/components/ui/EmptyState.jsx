import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'

/**
 * A successful request that returned nothing.
 *
 * Kept visually distinct from <ErrorState /> on purpose — an empty shop filter
 * is not a failure, and dressing it in alarm colours teaches shoppers to
 * distrust the site. Quiet type, an outline mark, and a way back out.
 */
function EmptyState({
  icon = 'box',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-(--radius-lg) border border-dashed border-line-strong px-6 py-14 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-(--radius-pill) border border-line-strong text-ink-soft"
      >
        <Icon name={icon} size={22} />
      </span>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[1.15rem]">{title}</h2>
        {description ? (
          <p className="max-w-[46ch] text-ink-soft [font-size:var(--text-sm)]">{description}</p>
        ) : null}
      </div>

      {actionLabel && (actionTo || onAction) ? (
        <Button variant="outline" size="sm" to={actionTo} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default EmptyState
