import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { servicePromises } from '../../data/home.js'
import { sectionIds } from '../../app/paths.js'

/**
 * What GiftMe actually guarantees — not what people supposedly said about it.
 *
 * This band used to run four headline figures ("10K+ gifts delivered",
 * "4.8/5 average rating") and three named customer testimonials. Every one of
 * them was invented copy: no endpoint produces them, nobody had verified them,
 * and published trade figures that turn out to be fabricated are a regulatory
 * problem rather than a copy problem.
 *
 * MISSING API — reviews and ratings. There is no review resource anywhere in
 * the backend: no table, no entity, no endpoint. Real social proof needs
 * `GET /api/products/{id}/reviews` (plus a way to collect consented quotes with
 * the order). Until that exists, this section makes only claims the system can
 * actually keep, each one traceable to real backend behaviour:
 *
 *   made to order      — nothing is printed before an order exists
 *   cash on delivery   — PaymentMethod has exactly one value, COD
 *   tracked end to end — every order gets a tracking code and a TrackingEvent
 *                        on every status change (business rule #8)
 *   ~5 days            — OrderServiceImpl.ESTIMATED_DELIVERY_DAYS
 *
 * When the reviews API lands, restore the quote grid here and read it from the
 * API — the layout below is deliberately close to what it was.
 */
function SocialProof() {
  return (
    <section
      id={sectionIds.reviews}
      aria-labelledby="proof-title"
      className="border-y border-line bg-bone py-(--section-y)"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="proof-title"
            align="center"
            eyebrow="Trusted with the moment"
            title={
              <>
                Given, opened, <em>kept.</em>
              </>
            }
            description="Every order leaves here made to order and packed by hand — and most of them arrive on a day someone had been planning for."
          />
        </Reveal>

        <ul className="grid border-t border-line-strong max-nav:grid-cols-1 max-wide:mt-11 max-wide:gap-5 nav:grid-cols-4 wide:mt-14 wide:gap-6">
          {servicePromises.map((promise, index) => (
            <Reveal as="li" key={promise.id} delay={index * 90}>
              <div className="flex h-full flex-col rounded-(--radius-md) border border-line bg-ivory transition-[border-color,box-shadow] duration-300 ease-brand hover:border-line-strong hover:shadow-(--shadow-sm) max-wide:p-6 wide:p-7">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-(--radius-pill) bg-clay-tint text-clay-deep"
                >
                  <Icon name={promise.icon} size={19} />
                </span>

                <h3 className="mt-5 text-[1.0625rem] leading-snug">{promise.title}</h3>

                <p className="mt-2.5 flex-1 text-ink-soft [font-size:var(--text-sm)]">
                  {promise.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default SocialProof
