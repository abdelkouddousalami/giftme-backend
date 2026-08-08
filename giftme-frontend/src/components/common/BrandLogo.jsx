import { Link } from 'react-router-dom'
import { paths } from '../../app/paths.js'

/**
 * The GiftMe brand mark + wordmark. The only logo markup in the app.
 *
 * THE MARK — one continuous line doing three jobs at once:
 *   - the lower rounded rectangle reads as a photo frame (the memory)
 *   - its top edge lifts into a tied ribbon (the gift)
 *   - the two ribbon loops meeting at a point sketch the top of a heart
 * A caramel tie drops from the knot to a single caramel dot held inside the
 * frame — the moment being kept, and the thing you scan for. Two colours, five
 * strokes, no fill: it survives 16px (favicon), embossing (packaging) and a
 * dark surface (footer, QR Memory page) without redrawing.
 *
 * THE WORDMARK — Playfair with "Me" in dusty rose, and a caramel hairline
 * ribbon that sits under "Me" and unties itself across the whole word on
 * hover. That hairline is the typographic signature; it is a scaled
 * pseudo-underline rather than a fitted SVG so it tracks the text at any size
 * and survives the serif fallback stack.
 *
 * Drawn in code rather than imported, so it is ours to reuse anywhere. Every
 * stroke bar the caramel inherits `currentColor`, so tone is the parent's call.
 */

const SIZES = {
  sm: { mark: 22, word: 'text-[1.05rem]' },
  md: { mark: 28, word: 'text-[1.4rem]' },
  lg: { mark: 34, word: 'text-[1.8rem]' },
}

function LogoMark({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* the memory frame, its top edge left open for the knot */}
        <path d="M12.4 12H9.2A3.7 3.7 0 0 0 5.5 15.7v7.6A3.7 3.7 0 0 0 9.2 27h13.6a3.7 3.7 0 0 0 3.7-3.7v-7.6A3.7 3.7 0 0 0 22.8 12h-3.2" />
        {/* the ribbon: two loops tied over the frame, and wider than it, so
            the pair also reads as the two lobes of a heart */}
        <path d="M16 12C11.6 12.4 6.4 12 4.4 10 2.9 8.5 3.6 6.2 5.9 5.8 9 5.2 13.4 8.2 16 12Z" />
        <path d="M16 12C20.4 12.4 25.6 12 27.6 10 29.1 8.5 28.4 6.2 26.1 5.8 23 5.2 18.6 8.2 16 12Z" />
      </g>
      {/* the tie, dropping towards the moment it keeps */}
      <g stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 12v2.6" fill="none" />
        <circle cx="16" cy="20" r="2.2" fill="var(--color-accent)" stroke="none" />
      </g>
    </svg>
  )
}

function BrandLogo({
  variant = 'default',
  tone = 'default',
  size = 'md',
  className = '',
}) {
  const { mark, word } = SIZES[size] ?? SIZES.md
  const isInverse = tone === 'inverse'
  const showWordmark = variant !== 'compact'

  return (
    <Link
      to={paths.home}
      aria-label="GiftMe, home"
      className={[
        'group inline-flex items-center gap-2.5',
        isInverse ? 'text-paper' : 'text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {variant === 'wordmark' ? null : <LogoMark size={mark} />}

      {showWordmark ? (
        <span className="relative inline-block">
          <span
            className={`block font-display font-medium leading-none tracking-[-0.015em] ${word}`}
          >
            {'Gift'}
            <span className={isInverse ? 'text-blush' : 'text-rose'}>Me</span>
          </span>

          {/* the ribbon: tied under "Me", unties across the word on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[0.16em] block h-px origin-right scale-x-[0.38] bg-caramel transition-transform duration-500 ease-brand group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </span>
      ) : (
        <span className="sr-only">GiftMe</span>
      )}
    </Link>
  )
}

export default BrandLogo
