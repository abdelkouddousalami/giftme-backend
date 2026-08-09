import { useTranslation } from 'react-i18next'
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
 * finished order and three notes about how the thing is actually made.
 */

const NOTE_KEYS = {
  print: { label: 'home.showcase.print', text: 'home.showcase.printText' },
  box: { label: 'home.showcase.box', text: 'home.showcase.boxText' },
  tag: { label: 'home.showcase.tag', text: 'home.showcase.tagText' },
}

function ProductShowcase() {
  const { t } = useTranslation()
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
                {t('home.showcase.caption')}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal
            delay={120}
            className="flex flex-col justify-center nav:col-span-5 nav:pt-6"
          >
            <SectionHeading
              id="showcase-title"
              eyebrow={t('home.showcase.eyebrow')}
              title={
                <>
                  {t('home.showcase.titleLine1')} <em>{t('home.showcase.titleEm')}</em>
                </>
              }
              description={t('home.showcase.description')}
            />

            <dl className="mt-9 border-t border-line">
              {craftNotes.map((note) => (
                <div
                  key={note.id}
                  className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-5 border-b border-line py-4"
                >
                  <dt className="pt-0.5 text-[0.6875rem] font-medium tracking-[0.14em] text-ink uppercase">
                    {t(NOTE_KEYS[note.id].label)}
                  </dt>
                  <dd className="m-0 text-ink-soft [font-size:var(--text-sm)]">
                    {t(NOTE_KEYS[note.id].text)}
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
