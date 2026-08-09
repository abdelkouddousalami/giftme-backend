import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { images } from '../../assets/images'
import { craftNotes } from '../../data/home.js'
import { sectionIds } from '../../app/paths.js'

/**
 * The showcase is photography, not merchandising.
 *
 * The shop grid three sections up has already done the naming, pricing and
 * linking; if this band repeated any of that it would read as the same section
 * twice. So it carries no prices and no buttons — one large photograph of a
 * finished order, three notes about how the thing is actually made, and two
 * wide details underneath.
 *
 * The details are deliberately landscape crops of photographs the page has
 * already shown in portrait. Same work, different framing: the eye reads it as
 * a second look rather than as a repeat.
 */

const DETAILS = [
  {
    id: 'tag',
    src: images.productQrMemory,
    alt: 'Hands holding a kraft gift tag printed with a QR code, beside the phone showing the memory page it opens',
    position: '50% 46%',
    caption: 'The tag — kraft card, hand-tied, one code',
  },
  {
    id: 'pieces',
    src: images.productPuzzle,
    alt: 'A personalized photo puzzle assembled beside the printed photograph it was made from',
    position: '50% 52%',
    caption: 'The pieces — 500 of them, cut from your photo',
  },
]

function ProductShowcase() {
  return (
    <section
      id={sectionIds.showcase}
      aria-labelledby="showcase-title"
      className="py-(--section-y)"
    >
      <Container>
        <div className="grid gap-y-10 nav:grid-cols-12 nav:max-wide:gap-x-12 wide:gap-x-16">
          <Reveal className="nav:col-span-7">
            {/* No preflight: <figure> keeps its UA margin unless reset. */}
            <figure className="m-0">
              <div className="overflow-hidden rounded-(--radius-md) bg-bone shadow-(--shadow-sm)">
                <img
                  src={images.customerGift}
                  alt="A personalized photo puzzle and a matching mug, both printed with the same illustrated portrait of a couple"
                  width="1200"
                  height="1592"
                  loading="lazy"
                  className="w-full [aspect-ratio:4/5] object-cover [object-position:44%_46%]"
                />
              </div>

              <figcaption className="mt-4 flex items-baseline gap-3 text-ink-soft [font-size:var(--text-xs)]">
                <span
                  aria-hidden="true"
                  className="mt-2 block h-px w-6 shrink-0 bg-clay"
                />
                A finished order — one portrait, printed twice, boxed together.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal
            delay={120}
            className="flex flex-col justify-center nav:col-span-5 nav:pt-6"
          >
            <SectionHeading
              id="showcase-title"
              eyebrow="The work"
              title={
                <>
                  Made by hand, <em>made for one person.</em>
                </>
              }
              description="Nothing here is printed before it is ordered. Every piece is proofed against your photo, packed the same day it comes off the press, and checked by the person who packs it."
            />

            <dl className="mt-9 border-t border-line">
              {craftNotes.map((note) => (
                <div
                  key={note.id}
                  className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-5 border-b border-line py-4"
                >
                  <dt className="pt-0.5 text-[0.6875rem] font-medium tracking-[0.14em] text-ink uppercase">
                    {note.label}
                  </dt>
                  <dd className="m-0 text-ink-soft [font-size:var(--text-sm)]">
                    {note.text}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default ProductShowcase
