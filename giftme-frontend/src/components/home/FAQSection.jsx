import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { faq } from '../../data/faq.js'
import { sectionIds } from '../../app/paths.js'
import './FAQSection.css'

const FAQ_KEYS = {
  personalization: { question: 'home.faq.personalizationQ', answer: 'home.faq.personalizationA' },
  'qr-memory': { question: 'home.faq.qrMemoryQ', answer: 'home.faq.qrMemoryA' },
  video: { question: 'home.faq.videoQ', answer: 'home.faq.videoA' },
  delivery: { question: 'home.faq.deliveryQ', answer: 'home.faq.deliveryA' },
  tracking: { question: 'home.faq.trackingQ', answer: 'home.faq.trackingA' },
  'cash-on-delivery': { question: 'home.faq.codQ', answer: 'home.faq.codA' },
}

/**
 * Single-open accordion: with six short answers, keeping one panel at a time
 * means the list never grows past a screen and the eye always knows where to
 * land. Collapsed panels use `visibility: hidden`, which keeps them out of the
 * tab order and the accessibility tree while still allowing the height to
 * animate.
 */
function FAQSection() {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState(faq[0].id)
  const baseId = useId()

  const toggle = (id) => setOpenId((current) => (current === id ? null : id))

  return (
    <section className="faq" id={sectionIds.faq} aria-labelledby="faq-title">
      <Container size="narrow">
        <Reveal>
          <SectionHeading
            id="faq-title"
            align="center"
            eyebrow={t('home.faq.eyebrow')}
            title={
              <>
                {t('home.faq.titleLine1')} <em>{t('home.faq.titleEm')}</em>
              </>
            }
          />
        </Reveal>

        <Reveal as="ul" className="faq__list">
          {faq.map((item) => {
            const isOpen = openId === item.id
            const triggerId = `${baseId}-trigger-${item.id}`
            const panelId = `${baseId}-panel-${item.id}`

            return (
              <li className="faq__item" key={item.id}>
                <h3 className="faq__heading">
                  <button
                    type="button"
                    id={triggerId}
                    className="faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id)}
                  >
                    <span>{t(FAQ_KEYS[item.id].question)}</span>
                    <Icon
                      name={isOpen ? 'minus' : 'plus'}
                      size={18}
                      strokeWidth={1.4}
                      className="faq__mark"
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={`faq__panel${isOpen ? ' is-open' : ''}`}
                >
                  <div className="faq__panel-inner">
                    <p className="faq__answer">{t(FAQ_KEYS[item.id].answer)}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </Reveal>
      </Container>
    </section>
  )
}

export default FAQSection
