import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { steps } from '../../data/home.js'
import { sectionIds } from '../../app/paths.js'
import './HowItWorks.css'

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
            description="Four steps, about ten minutes, and the rest is ours to make."
          />
        </Reveal>

        <ol className="how__steps">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.id}
              delay={index * 80}
              className="how__step"
            >
              <div className="how__step-head">
                <span className="how__step-number">{step.number}</span>
                <Icon name={step.icon} size={26} strokeWidth={1.25} />
              </div>

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
