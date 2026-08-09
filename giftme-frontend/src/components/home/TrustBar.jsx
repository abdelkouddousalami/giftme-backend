import Container from '../common/Container.jsx'
import Icon from '../common/Icon.jsx'
import { trustPoints } from '../../data/home.js'

/**
 * The band that answers the three questions a shopper asks before they will
 * look at a price: will I see it first, how do I pay, and when does it arrive.
 *
 * It used to be a row of uppercase fragments stapled to the bottom of the hero.
 * Given its own bone-coloured band between the hero and the shop, with a real
 * sentence under each promise, it does the job a storefront trust bar is
 * supposed to do — and it separates two ivory sections without a decorative
 * divider.
 */
function TrustBar() {
  return (
    <section
      aria-label="Ordering, payment and delivery"
      className="border-y border-line bg-bone"
    >
      <Container>
        <ul className="grid sm:grid-cols-3">
          {trustPoints.map((point, index) => (
            <li
              key={point.id}
              // `sm:px-6 wide:px-9` would never reach 9: a stock `sm:` utility is
              // emitted by both Tailwind entry points and deduped to the later
              // (admin) block, so it beats the storefront-only `wide:`. Range-
              // disjoint variants are the fix — see styles/tailwind.css.
              className={`flex items-start gap-4 border-line py-6 sm:max-wide:px-6 sm:py-7 wide:px-9 ${
                index > 0 ? 'max-sm:border-t sm:border-l' : ''
              }`}
            >
              <Icon
                name={point.icon}
                size={21}
                strokeWidth={1.3}
                className="mt-0.5 shrink-0 text-olive-deep"
              />

              <div className="min-w-0">
                <p className="text-[0.6875rem] leading-[1.5] font-medium tracking-[0.14em] text-ink uppercase">
                  {point.title}
                </p>
                <p className="mt-1.5 text-ink-soft [font-size:var(--text-sm)]">
                  {point.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default TrustBar
