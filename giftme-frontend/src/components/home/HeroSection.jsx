import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import HeroBackdrop from './HeroBackdrop.jsx'
import HeroAsides from './HeroAsides.jsx'
import { images } from '../../assets/images'
import { paths, sectionIds } from '../../app/paths.js'
import './HeroSection.css'

/**
 * The hero: a centred editorial block, framed by product photography.
 *
 * The composition is a triptych — work, headline, work — and the headline wins.
 * The corridor between the two is declared in HeroSection.css rather than left
 * to chance: the centre column is capped at whatever the side columns and their
 * minimum air leave behind, so the headline wraps to a third line before it can
 * ever reach a photograph. Measured across 768–1920px, the version that let
 * both sides scale freely put the images on top of the type at three common
 * widths.
 *
 * Below `md` the columns are gone and the work appears as a small strip under
 * the calls to action instead. A side column narrow enough to fit a phone is a
 * column narrow enough to be in the way.
 *
 * This section is the only place on the site with continuous motion: the type
 * arrives in sequence on load, then the four product cards drift a handful of
 * pixels forever. Everything is disabled under prefers-reduced-motion by
 * globals.css. `svh` rather than `vh` in the height clamp so a mobile browser's
 * collapsing address bar cannot push the calls to action off the fold.
 */

/** The phone composition: three squares, quiet, under the buttons. */
const STRIP = [
  { id: 'puzzle', src: images.productPuzzle, position: '50% 40%' },
  { id: 'qr', src: images.productQrMemory, position: '50% 46%' },
  { id: 'mug', src: images.productMug, position: '50% 82%' },
]

function HeroSection() {
  const { t } = useTranslation()
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroBackdrop />
      <HeroAsides />

      <Container className="relative z-10 flex min-h-[clamp(27rem,64svh,36rem)] flex-col items-center justify-center py-(--section-y-lg) text-center">
        <div className="hero__content flex flex-col items-center">
          <p className="eyebrow eyebrow--centered animate-rise">
            {t('home.hero.eyebrow')}
          </p>

          <h1
            id="hero-title"
            /* No `max-w` here on purpose. `hero__content` is the single width
               authority for the centre column; a second, font-relative cap
               (15ch) fought with it and flipped the headline between two and
               three lines as the viewport grew — 2 lines at 1024, 3 at 1100,
               2 again at 1280. */
            className="mt-6 [font-size:var(--text-display-1)] [line-height:var(--leading-display)]"
          >
            <span
              className="block animate-rise"
              style={{ animationDelay: '90ms' }}
            >
              {t('home.hero.titleLine1')}
            </span>
            <em
              className="block animate-rise text-burgundy italic"
              style={{ animationDelay: '180ms' }}
            >
              {t('home.hero.titleLine2')}
            </em>
          </h1>

          <p
            className="mt-7 max-w-[44ch] animate-rise text-ink-soft [font-size:var(--text-xl)]"
            style={{ animationDelay: '280ms' }}
          >
            {t('home.hero.lead')}
          </p>

          <div
            className="mt-9 flex animate-rise flex-col items-center gap-x-8 gap-y-4 sm:flex-row"
            style={{ animationDelay: '380ms' }}
          >
            <Button to={paths.shop} size="lg">
              {t('home.hero.cta')}
            </Button>

            {/* Not a second button. A hairline that draws itself in on hover —
                the same gesture as the header's navigation, so there is one
                house style for "this is a link", and the ink button stays the
                only thing in the hero asking to be pressed. */}
            <a
              href={`#${sectionIds.gifts}`}
              className="group inline-flex items-center gap-2 py-1 text-[0.9375rem] font-medium text-ink transition-colors duration-200 hover:text-burgundy"
            >
              <span className="relative">
                <span>{t('home.hero.explore')}</span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 block h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-brand group-hover:scale-x-100 rtl:right-0 rtl:left-auto rtl:origin-right"
                />
              </span>
              <Icon
                name="arrowRight"
                size={17}
                className="transition-transform duration-200 ease-brand group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
              />
            </a>
          </div>

          {/* Phones only. Same job as the side columns — show the work without
              arguing with the headline — done as a footnote instead of a frame,
              because at this width there is no "beside". */}
          <ul
            aria-hidden="true"
            className="mt-11 w-full max-w-[21rem] animate-rise gap-2.5 max-md:grid max-md:grid-cols-3 md:hidden"
            style={{ animationDelay: '520ms' }}
          >
            {STRIP.map((piece) => (
              <li key={piece.id}>
                <figure className="m-0 overflow-hidden rounded-(--radius-md) bg-bone shadow-(--shadow-sm)">
                  <img
                    src={piece.src}
                    alt=""
                    className="w-full [aspect-ratio:1] object-cover"
                    style={{ objectPosition: piece.position }}
                  />
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}

export default HeroSection
