import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import { steps } from '../../data/home.js'
import { sectionIds } from '../../app/paths.js'
import './HowItWorks.css'

const STEP_KEYS = {
  choose: { title: 'home.howItWorks.steps.chooseTitle', description: 'home.howItWorks.steps.chooseDescription' },
  personalize: {
    title: 'home.howItWorks.steps.personalizeTitle',
    description: 'home.howItWorks.steps.personalizeDescription',
  },
  deliver: { title: 'home.howItWorks.steps.deliverTitle', description: 'home.howItWorks.steps.deliverDescription' },
}

/**
 * Three steps, set as a printed run-on rather than three cards: one hairline
 * across the top of the row, a large clay numeral under it, and nothing else.
 * The section that follows it is a photograph, so this one is deliberately the
 * quietest thing on the page.
 */
function HowItWorks() {
  const { t } = useTranslation()
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
            eyebrow={t('home.howItWorks.eyebrow')}
            title={
              <>
                {t('home.howItWorks.titleLine1')} <em>{t('home.howItWorks.titleEm')}</em>
              </>
            }
            description={t('home.howItWorks.description')}
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

              <h3 className="how__step-title">{t(STEP_KEYS[step.id].title)}</h3>
              <p className="how__step-text">{t(STEP_KEYS[step.id].description)}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}

export default HowItWorks
