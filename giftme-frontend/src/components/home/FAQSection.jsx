import { useId, useState } from 'react'
import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { faq } from '../../data/faq.js'
import { sectionIds } from '../../app/paths.js'
import './FAQSection.css'

/**
 * Single-open accordion: with six short answers, keeping one panel at a time
 * means the list never grows past a screen and the eye always knows where to
 * land. Collapsed panels use `visibility: hidden`, which keeps them out of the
 * tab order and the accessibility tree while still allowing the height to
 * animate.
 */
function FAQSection() {
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
            eyebrow="Good to know"
            title={
              <>
                Questions, <em>answered.</em>
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
                    <span>{item.question}</span>
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
                    <p className="faq__answer">{item.answer}</p>
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
