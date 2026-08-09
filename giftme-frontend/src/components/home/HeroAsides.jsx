import Container from '../common/Container.jsx'
import { images } from '../../assets/images'

/**
 * The two product compositions that flank the hero headline.
 *
 * They exist to frame the type, not to be browsed: no names, no prices, no
 * links, and `pointer-events-none` throughout, so the ink CTA in the middle
 * stays the only thing in the section asking to be pressed. The same four
 * photographs are named, priced and linked one screen below in the shop grid,
 * which is why the whole block is `aria-hidden` — a screen reader gets the
 * headline and the two calls to action, and loses nothing.
 *
 * Deliberately not mirrored. The left column's anchor sits at the BOTTOM with a
 * small detail above it and pushed to the right; the right column's anchor sits
 * at the TOP with a detail below it and pushed to the left. Different aspect
 * ratios, different widths, different vertical offsets — the balance is in the
 * weight, not in the geometry.
 *
 * Width comes from `--hero-col` in HeroSection.css, the same variable the
 * centre column subtracts from its own maximum width — which is what makes the
 * corridor between photograph and headline a guarantee rather than a hope. The
 * columns live inside a normal Container, so they hold the page's gutter at
 * every width. Below `md` the variable is 0 and this whole block is hidden;
 * HeroSection.jsx shows a small strip under the buttons instead, because a side
 * column narrow enough to fit a phone is a column that is in the way.
 *
 * Motion: the entry lives on the column, the ambient drift on each card. Two
 * levels, because an entry animates opacity + transform and a loop animates
 * transform, and one element cannot run both without the loop winning.
 */

const CARD =
  'm-0 overflow-hidden rounded-(--radius-md) bg-bone shadow-(--shadow-md)'

function HeroAsides() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 max-md:hidden md:block"
    >
      <Container className="flex h-full items-center justify-between">
        {/* Left: the mug as a small landscape detail, the puzzle as the anchor
            underneath it. */}
        <div
          className="hero__aside translate-y-6 animate-hero-in-left"
          style={{ animationDelay: '520ms' }}
        >
          <figure className={`${CARD} ml-auto w-[76%] animate-hero-drift-a`}>
            <img
              src={images.productMug}
              alt=""
              width="750"
              height="820"
              className="w-full [aspect-ratio:1] object-cover [object-position:50%_78%]"
            />
          </figure>

          <figure className={`${CARD} mt-5 w-full animate-hero-drift-b`}>
            <img
              src={images.productPuzzle}
              alt=""
              width="736"
              height="981"
              className="w-full [aspect-ratio:4/5] object-cover [object-position:50%_40%]"
            />
          </figure>
        </div>

        {/* Right: the QR memory tag as the anchor, the boxed set tucked under
            it and pulled back to the left. */}
        <div
          className="hero__aside -translate-y-4 animate-hero-in-right"
          style={{ animationDelay: '640ms' }}
        >
          <figure className={`${CARD} w-full animate-hero-drift-c`}>
            <img
              src={images.productQrMemory}
              alt=""
              width="768"
              height="1152"
              className="w-full [aspect-ratio:3/4] object-cover [object-position:50%_45%]"
            />
          </figure>

          {/* Same drift as the left column's top card, half a cycle out of
              phase. A negative delay shifts the loop without holding it still
              first, so nothing waits 6 seconds to start moving. */}
          <figure
            className={`${CARD} mt-5 mr-auto w-[72%] animate-hero-drift-a`}
            style={{ animationDelay: '-6.5s' }}
          >
            <img
              src={images.customerGift}
              alt=""
              width="1200"
              height="1592"
              className="w-full [aspect-ratio:4/5] object-cover [object-position:48%_44%]"
            />
          </figure>
        </div>
      </Container>
    </div>
  )
}

export default HeroAsides
