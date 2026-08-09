import { Link } from 'react-router-dom'
import { images } from '../../assets/images'
import { paths } from '../../app/paths.js'

/**
 * The GiftMe logo. The only logo markup in the app.
 *
 * It renders the master artwork itself
 * (`assets/images/4EB6D51C-F768-4E98-99E7-019C064C22B4.png`) rather than the
 * vector reconstruction that used to live here — the master is the brand, and
 * a redrawing of it will always drift.
 *
 * THE CROP. The file is a 1536×1024 transparent canvas with the lockup sitting
 * in a 992×307 window at (275, 322); the other ~65% is empty. That is trimmed
 * in CSS rather than in the file, so the asset on disk is never touched:
 *
 *   frame   aspect-ratio 992/307, overflow hidden, height set by `size`
 *   image   scaled so its 992px-wide window fills the frame, then pushed up and
 *           left by the window's own offset
 *
 * Every percentage below is computed from ART, so re-measuring the artwork is
 * a one-line change. Both boxes have intrinsic dimensions, so the logo reserves
 * its space before the PNG decodes and the header never shifts.
 *
 * THE DARK VARIANT. "Gift" is set in near-black in the master, which vanishes
 * against the footer's ink ground. `variant="light"` knocks the whole lockup
 * back to a single white silhouette — the standard mono-on-dark treatment, and
 * the only one that keeps the wordmark legible without recolouring the brand.
 */

/** Measured from the asset with a canvas alpha scan; see the note above. */
const ART = { x: 275, y: 322, w: 992, h: 307, canvasW: 1536, canvasH: 1024 }

const pct = (value) => `${+(value * 100).toFixed(4)}%`

const FRAME_IMAGE = {
  position: 'absolute',
  top: pct(-ART.y / ART.h),
  left: pct(-ART.x / ART.w),
  width: pct(ART.canvasW / ART.w),
  maxWidth: 'none',
  height: 'auto',
}

/** Lockup heights. The width follows from the artwork's 992:307 proportion. */
const SIZES = {
  sm: '1.5rem',
  md: '2.125rem',
  lg: '2.75rem',
}

function BrandLogo({
  variant = 'default',
  size = 'md',
  className = '',
  ...rest
}) {
  return (
    <Link
      to={paths.home}
      aria-label="GiftMe, home"
      className={[
        'inline-block shrink-0 transition-opacity duration-200 hover:opacity-80',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span
        className="relative block overflow-hidden"
        style={{
          height: SIZES[size] ?? SIZES.md,
          aspectRatio: `${ART.w} / ${ART.h}`,
        }}
      >
        <img
          src={images.brandLogo}
          alt=""
          width={ART.canvasW}
          height={ART.canvasH}
          decoding="async"
          style={{
            ...FRAME_IMAGE,
            filter:
              variant === 'light' ? 'brightness(0) invert(1)' : undefined,
          }}
        />
      </span>
    </Link>
  )
}

export default BrandLogo
