import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { benefits } from '../../data/home.js'
import './WhyGiftMe.css'

function WhyGiftMe() {
  return (
    <section className="why" aria-labelledby="why-title">
      <Container>
        <Reveal>
          <SectionHeading
            id="why-title"
            align="center"
            eyebrow="The difference"
            title={
              <>
                Why <em>GiftMe?</em>
              </>
            }
          />
        </Reveal>

        <ul className="why__grid">
          {benefits.map((benefit, index) => (
            <Reveal
              as="li"
              key={benefit.id}
              delay={index * 80}
              className="why__item"
            >
              <span className="why__icon">
                <Icon name={benefit.icon} size={24} strokeWidth={1.25} />
              </span>
              <h3 className="why__item-title">{benefit.title}</h3>
              <p className="why__item-text">{benefit.description}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default WhyGiftMe
