import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import { homeAnchor, sectionIds } from '../../app/paths.js'

/**
 * The quiet line above the header.
 *
 * Deliberately not a promo strip: no discount, no urgency, no exclamation
 * mark. It states what GiftMe is for, in the same uppercase micro-type the
 * section eyebrows use, so it reads as part of the masthead rather than as
 * advertising. It scrolls away with the page — only the header is sticky.
 *
 * One moving detail: a hairline crossing the rule at the foot of the bar, once
 * every eighteen seconds. globals.css stops it under prefers-reduced-motion.
 */
function AnnouncementBar() {
  return (
    <aside
      aria-label="GiftMe announcement"
      className="relative isolate overflow-hidden border-b border-sage-tint bg-mist text-ink"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 block h-px overflow-hidden"
      >
        <span className="block h-full w-[28%] animate-thread opacity-60 [background-image:linear-gradient(90deg,transparent,var(--color-secondary),transparent)]" />
      </span>

      <Container className="flex min-h-[2.375rem] items-center justify-center py-2">
        <p className="text-center text-[0.6875rem] leading-[1.5] tracking-[0.16em] uppercase sm:text-[0.72rem] sm:tracking-[0.18em]">
          {'Every gift tells a story'}
          <span
            aria-hidden="true"
            className="mx-3 hidden h-1 w-1 translate-y-[-0.15em] rounded-full bg-caramel align-middle sm:inline-block"
          />
          <Link
            to={homeAnchor(sectionIds.qrMemory)}
            className="hidden decoration-caramel decoration-1 underline-offset-[0.4em] transition-colors duration-200 hover:text-rose hover:underline sm:inline"
          >
            Add a private QR memory to yours
          </Link>
        </p>
      </Container>
    </aside>
  )
}

export default AnnouncementBar
