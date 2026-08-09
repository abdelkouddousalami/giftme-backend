import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import { homeAnchor, sectionIds } from '../../app/paths.js'

/**
 * The line above the header.
 *
 * It states three facts a gift shopper is actually weighing — what this shop
 * makes, what makes it different, and when it arrives — rather than a discount
 * or a countdown. Ink ground, paper type, one clay mark between each: it reads
 * as the top edge of the masthead, which is why the header below it is ivory
 * and unlined until you scroll.
 *
 * It scrolls away with the page; only the header is sticky.
 *
 * On phones the third fact steps out rather than wrapping the line into an
 * untidy block — delivery is repeated in full in the trust bar a screen below,
 * so nothing is lost.
 */

function Mark({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[3px] w-[3px] shrink-0 rotate-45 bg-clay ${className}`}
    />
  )
}

function AnnouncementBar() {
  return (
    <aside
      aria-label="GiftMe announcement"
      className="bg-ink text-paper"
    >
      <Container className="flex min-h-[2.5rem] items-center justify-center py-2">
        <p className="flex items-center justify-center gap-x-3 text-center text-[0.625rem] leading-[1.6] tracking-[0.18em] uppercase sm:gap-x-4 sm:text-[0.6875rem] sm:tracking-[0.2em]">
          <span>Personalized gifts</span>

          <Mark />

          <Link
            to={homeAnchor(sectionIds.qrMemory)}
            className="underline-offset-[0.45em] transition-opacity duration-200 hover:underline hover:opacity-80"
          >
            Private QR memories
          </Link>

          <Mark className="max-sm:hidden" />

          <span className="max-sm:hidden">Delivered in 3–5 days</span>
        </p>
      </Container>
    </aside>
  )
}

export default AnnouncementBar
