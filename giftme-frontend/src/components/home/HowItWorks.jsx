import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { steps } from '../../data/home.js'
import { sectionIds } from '../../app/paths.js'
import './HowItWorks.css'

/**
 * Three steps, set as a printed run-on rather than three cards: one hairline
 * across the top of the row, a large clay numeral under it, and nothing else.
 * The section that follows it is a photograph, so this one is deliberately the
 * quietest thing on the page.
 */
function HowItWorks() {
  return (
    <section
      className="how"
      id={sectionIds.howItWorks}
      aria-labelledby="how-title"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="how-title"
            align="center"
            eyebrow="How GiftMe works"
            title={
              <>
                From a moment to a <em>memory.</em>
              </>
            }
            description="Three steps, about ten minutes, and the rest is ours to make."
          />
        </Reveal>

        <ol className="how__steps">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.id}
              delay={index * 90}
              className="how__step"
            >
              <span className="how__step-number" aria-hidden="true">
                {step.number}
              </span>

              <h3 className="how__step-title">{step.title}</h3>
              <p className="how__step-text">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}

export default HowItWorks
