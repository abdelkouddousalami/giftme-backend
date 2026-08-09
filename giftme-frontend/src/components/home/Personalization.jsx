import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import { images } from '../../assets/images'
import { personalLayers } from '../../data/home.js'
import { paths, sectionIds } from '../../app/paths.js'

/**
 * What "personalized" actually means, before the QR section claims it means
 * something bigger.
 *
 * The left column is the mechanics — four layers a customer adds, in the order
 * the editor asks for them, each on its own ruled row so the list reads as a
 * process rather than as a feature grid. The right column is the result: two
 * pieces of the real work and, between them, the card that travels inside the
 * box. The card is the emotional beat of the section and the only place on the
 * page where a customer's own words are shown, so it is set in the display
 * italic and given a whole panel to itself.
 */
function Personalization() {
  return (
    <section
      id={sectionIds.personalize}
      aria-labelledby="personalize-title"
      className="py-(--section-y)"
    >
      <Container>
        <div className="grid max-nav:gap-12 nav:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] nav:items-center nav:max-wide:gap-16 wide:gap-20">
          <Reveal>
            <SectionHeading
              id="personalize-title"
              eyebrow="Personalization"
              title={
                <>
                  Make it <em>personal.</em>
                </>
              }
              description="Everything on a GiftMe piece is something you chose. Four layers, added in about ten minutes, previewed before anything is printed."
            />

            <ol className="mt-10 border-t border-line">
              {personalLayers.map((layer, index) => (
                <li
                  key={layer.id}
                  className="flex gap-5 border-b border-line py-5"
                >
                  <span className="font-display pt-0.5 text-[0.8125rem] text-clay-deep tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-sans flex items-center gap-2.5 text-[0.9375rem] leading-snug font-medium tracking-normal">
                      <Icon
                        name={layer.icon}
                        size={17}
                        strokeWidth={1.4}
                        className="shrink-0 text-olive-deep"
                      />
                      {layer.title}
                    </h3>

                    <p className="mt-1.5 max-w-[44ch] text-ink-soft [font-size:var(--text-sm)]">
                      {layer.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Button
              to={paths.shop}
              variant="outline"
              className="mt-9"
              trailingIcon="arrowRight"
            >
              Start personalizing
            </Button>
          </Reveal>

          <Reveal delay={120}>
            {/* Two arrangements, not one shrunk down.
                From `sm` it is a single row: the narrow column (card over
                photograph) sets the height, and the tall photograph beside it
                fills whatever that comes to — so the block is always flush at
                the bottom whatever the card's copy runs to.
                Below `sm` that column would be ~140px wide and the message
                would break to one word per line, so the row is abandoned: a
                wide crop of the gift, then the card at full width. The second
                photograph steps out rather than making the section longer. */}
            <div className="grid max-sm:gap-4 sm:grid-cols-9 sm:gap-5">
              <figure className="m-0 overflow-hidden rounded-(--radius-md) bg-bone shadow-(--shadow-sm) sm:col-span-5 sm:h-full">
                <img
                  src={images.productMug}
                  alt="A white ceramic mug printed with a custom portrait and the name Camila, boxed in tissue beside a matching bottle"
                  loading="lazy"
                  className="w-full object-cover [object-position:50%_58%] max-sm:[aspect-ratio:5/4] sm:h-full"
                />
              </figure>

              <div className="flex min-w-0 flex-col max-sm:gap-4 sm:col-span-4 sm:gap-5">
                <figure className="m-0 rounded-(--radius-md) border border-line bg-bone p-5">
                  <figcaption className="text-[0.5625rem] font-medium tracking-[0.16em] text-ink-soft uppercase">
                    Your message
                  </figcaption>
                  {/* No preflight: <blockquote> keeps its 40px UA indent
                      unless the inline margins are reset here. */}
                  <blockquote className="font-display mx-0 mt-3 mb-0 text-[1rem] leading-[1.55] text-ink italic">
                    <p>
                      Two years, and I&rsquo;d still choose that evening again.
                    </p>
                  </blockquote>
                  <span
                    aria-hidden="true"
                    className="mt-4 block h-px w-8 bg-clay"
                  />
                </figure>

                <figure className="m-0 overflow-hidden rounded-(--radius-md) bg-bone shadow-(--shadow-sm) max-sm:hidden">
                  <img
                    src={images.productPuzzle}
                    alt="A personalized puzzle, partly assembled on a wooden table"
                    loading="lazy"
                    className="w-full [aspect-ratio:4/5] object-cover [object-position:52%_34%]"
                  />
                </figure>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default Personalization
