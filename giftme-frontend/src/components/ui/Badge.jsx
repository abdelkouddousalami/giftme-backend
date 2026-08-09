/**
 * Small status / label mark.
 *
 * `tone` maps to the brand's semantic colours rather than the usual
 * green/red/amber traffic light — this palette has no green, and a warning
 * amber would be the only colour on the page outside the identity.
 */

const TONES = {
  neutral: 'border-line-strong bg-bone text-ink-soft',
  ink: 'border-transparent bg-ink text-paper',
  olive: 'border-transparent bg-olive-mist text-olive-deep',
  clay: 'border-transparent bg-clay-tint text-clay-deep',
  burgundy: 'border-transparent bg-burgundy-tint text-burgundy-deep',
}

function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-(--radius-xs) border px-2.5 py-1',
        'text-[0.625rem] leading-none font-medium tracking-[0.14em] uppercase',
        TONES[tone] ?? TONES.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

/**
 * Order status as a badge. CANCELLED is the only status that reads as a
 * problem, DELIVERED as an ending; everything between is in-flight.
 */
export function statusTone(status) {
  if (status === 'CANCELLED') return 'burgundy'
  if (status === 'DELIVERED') return 'olive'
  return 'clay'
}

export default Badge
