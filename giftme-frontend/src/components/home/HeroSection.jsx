import { useEffect, useRef } from 'react'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import { images } from '../../assets/images'
import { paths, sectionIds } from '../../app/paths.js'

const assurances = [
  'Free personalization preview',
  'Cash on delivery',
  'Delivered in 3–5 days',
]

/**
 * Pointer parallax, expressed as depth in pixels.
 *
 * `--gm-mx` / `--gm-my` are set on the section by the effect below and run
 * from -0.5 to 0.5. Reading them here — rather than positioning each object
 * from JS — keeps the maths in one place and lets an object float on its own
 * keyframes while its wrapper does the parallax.
 */
const depth = (px, extra = '') => ({
  transform: `translate3d(calc(var(--gm-mx, 0) * ${px}px), calc(var(--gm-my, 0) * ${Math.round(px * 0.7)}px), 0)${extra}`,
})

function HeroSection() {
  const sectionRef = useRef(null)

  /**
   * The whole hero is the parallax surface, so the composition answers to the
   * pointer wherever it is in the section. Skipped outright for coarse
   * pointers (nothing to track) and for anyone who asked for less motion — the
   * listener is never attached, so there is no work to throw away either.
   */
  useEffect(() => {
    const section = sectionRef.current

    if (!section || typeof window.matchMedia !== 'function') return undefined

    const finePointer = window.matchMedia('(pointer: fine)')
    const wantsLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!finePointer.matches || wantsLessMotion.matches) return undefined

    let frame = 0

    const onPointerMove = (event) => {
      if (frame) return

      const { clientX, clientY } = event

      frame = window.requestAnimationFrame(() => {
        frame = 0

        const rect = section.getBoundingClientRect()

        if (!rect.width || !rect.height) return

        const x = (clientX - rect.left) / rect.width - 0.5
        const y = (clientY - rect.top) / rect.height - 0.5

        section.style.setProperty('--gm-mx', x.toFixed(3))
        section.style.setProperty('--gm-my', y.toFixed(3))
      })
    }

    const onPointerLeave = () => {
      section.style.setProperty('--gm-mx', '0')
      section.style.setProperty('--gm-my', '0')
    }

    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)

    return () => {
      window.cancelAnimationFrame(frame)
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden pt-8 pb-(--section-y) wide:pt-14 wide:pb-(--section-y-lg)"
      aria-labelledby="hero-title"
    >
      {/* Atmosphere: two washes, no edges. Blush behind the object, sage under
          the type, so the palette reads warm without ever going saturated. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[18%] -right-[12%] -z-10 aspect-square w-[min(760px,88%)] rounded-full opacity-55 [background:radial-gradient(circle,var(--color-primary-light)_0%,transparent_68%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[26%] -left-[18%] -z-10 aspect-square w-[min(520px,72%)] rounded-full opacity-60 [background:radial-gradient(circle,var(--color-secondary-light)_0%,transparent_70%)]"
      />

      <Container className="relative grid gap-y-10 wide:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] wide:grid-rows-[1fr_auto] wide:items-center wide:gap-x-12">
        <div className="flex flex-col items-start gap-5 wide:col-start-1 wide:row-start-1 wide:self-center">
          <p className="eyebrow animate-rise">More than a gift, a memory</p>

          <h1
            id="hero-title"
            className="max-w-[15ch] [font-size:var(--text-display-1)] [line-height:var(--leading-display)]"
          >
            <span
              className="block animate-rise"
              style={{ animationDelay: '90ms' }}
            >
              Create a gift
            </span>
            <em
              className="block animate-rise text-rose italic"
              style={{ animationDelay: '180ms' }}
            >
              they will never forget.
            </em>
          </h1>

          <p
            className="max-w-[46ch] animate-rise text-ink-soft [font-size:var(--text-xl)]"
            style={{ animationDelay: '280ms' }}
          >
            Personalized gifts with QR memories that turn moments into lasting
            feelings.
          </p>

          <div
            className="flex animate-rise flex-wrap items-center gap-x-7 gap-y-3 pt-1"
            style={{ animationDelay: '380ms' }}
          >
            <Button to={paths.shop} size="lg">
              Create Your Gift
            </Button>
            <Button
              href={`#${sectionIds.featuredGifts}`}
              variant="ghost"
              size="lg"
              trailingIcon="arrowRight"
            >
              Explore Gifts
            </Button>
          </div>
        </div>

        {/* --- The composition: objects placed on an editorial table -------- */}
        <div className="relative mx-auto w-full max-w-[520px] [padding-inline:9%_10%] wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:mr-0 wide:ml-auto wide:max-w-[620px] wide:self-center wide:pt-[11%] wide:[padding-inline:10%_11%]">
          {/* the handwritten note, in the breathing room above the puzzle */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-[3%] hidden w-[36%] wide:block"
          >
            <p className="font-display text-[0.95rem] leading-tight text-caramel italic">
              their favourite evening
            </p>
            <svg
              viewBox="0 0 120 44"
              fill="none"
              className="mt-1 w-[64%]"
              aria-hidden="true"
              focusable="false"
            >
              <g
                stroke="var(--color-accent)"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw"
                style={{ '--gm-dash': '190' }}
                strokeDasharray="190"
              >
                <path d="M112 5C82 4 44 11 24 27c-5 4-8 8-8 12" />
                <path d="M16 39 9 31M16 39l8-4" />
              </g>
            </svg>
          </div>

          {/* the puzzle: the one solid, physical object in the hero */}
          <figure
            className="gm-paper relative m-0 overflow-hidden rounded-(--radius-lg) transition-transform duration-500 ease-out [aspect-ratio:4/5] [box-shadow:var(--shadow-lg)]"
            style={depth(10, ' rotate(-1.2deg)')}
          >
            <img
              src={images.heroPuzzle}
              alt="Two people at sunset, printed and cut as a personalized jigsaw puzzle"
              width="900"
              height="1080"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </figure>

          {/* a memory fragment, as if left on the table */}
          <div
            className="absolute top-[3%] left-0 hidden w-[19%] transition-transform duration-500 ease-out sm:block"
            style={depth(26)}
          >
            <figure className="m-0 animate-drift-slower bg-white p-[6%] pb-[16%] [box-shadow:var(--shadow-md)] [rotate:-7deg]">
              <img
                src={images.moment2}
                alt=""
                width="400"
                height="400"
                className="w-full [aspect-ratio:1] object-cover"
              />
            </figure>
          </div>

          {/* a single loose piece — the personalization not yet placed */}
          <div
            className="absolute bottom-[19%] left-0 w-[26%] transition-transform duration-500 ease-out"
            style={depth(22)}
          >
            <img
              src={images.puzzlePiece}
              alt=""
              width="220"
              height="220"
              className="w-full animate-drift-slow [filter:drop-shadow(0_18px_26px_rgba(88,52,44,0.28))] [rotate:-9deg]"
            />
          </div>

          {/* the discovery: the QR memory that ships with the gift */}
          <div
            className="absolute right-0 bottom-[4%] w-[min(216px,66%)] transition-transform duration-500 ease-out sm:w-[min(264px,72%)]"
            style={depth(16)}
          >
            <figure className="m-0 flex animate-hover-card items-center gap-2.5 rounded-(--radius-md) bg-white p-2.5 [box-shadow:var(--shadow-lg)] sm:gap-3 sm:p-3">
              <img
                className="size-11 shrink-0 rounded-(--radius-sm) sm:size-[52px]"
                src={images.qrCode}
                alt=""
                width="200"
                height="200"
              />
              <figcaption className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-[0.9rem] leading-[1.2] sm:text-[1rem]">
                  Scan to remember
                </span>
                <span className="text-[0.55rem] leading-[1.3] tracking-[0.1em] text-ink-soft uppercase sm:text-[0.63rem]">
                  Photos · Video · Voice
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        <ul
          className="flex animate-rise flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:flex-wrap sm:gap-x-8 wide:col-start-1 wide:row-start-2"
          style={{ animationDelay: '480ms' }}
        >
          {assurances.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-[0.72rem] tracking-[0.13em] text-ink-soft uppercase"
            >
              <Icon
                name="check"
                size={14}
                strokeWidth={1.7}
                className="shrink-0 text-sage"
              />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default HeroSection
