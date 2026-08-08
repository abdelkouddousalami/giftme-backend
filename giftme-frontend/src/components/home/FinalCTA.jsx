import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Reveal from '../common/Reveal.jsx'
import { paths } from '../../app/paths.js'
import './FinalCTA.css'

function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <Container>
        <Reveal className="final-cta__panel">
          <p className="eyebrow eyebrow--centered">Ready when you are</p>

          <h2 id="final-cta-title" className="final-cta__title">
            Give them something they&rsquo;ll <em>remember.</em>
          </h2>

          <p className="final-cta__lead">
            Ten minutes now, a memory they keep for years. Start with the photo
            you already have in mind.
          </p>

          <Button to={paths.shop} size="lg" trailingIcon="arrowRight">
            Create Your Gift
          </Button>
        </Reveal>
      </Container>
    </section>
  )
}

export default FinalCTA
