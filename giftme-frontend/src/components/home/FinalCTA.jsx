import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import { paths, sectionIds } from '../../app/paths.js'
import './FinalCTA.css'

/**
 * The page's last word: one sand panel, centred, echoing the hero's
 * composition so the scroll ends where it began. The two decorative rings that
 * used to float in it are gone — depth here is a warm gradient and a tile of
 * grain, the same two devices the hero uses.
 */
function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <Container>
        <Reveal className="final-cta__panel">
          <span aria-hidden="true" className="grain" />

          <div className="final-cta__content">
            <p className="eyebrow eyebrow--centered">Ready when you are</p>

            <h2 id="final-cta-title" className="final-cta__title">
              Give them something they&rsquo;ll <em>remember.</em>
            </h2>

            <p className="final-cta__lead">
              Personalized gifts made for the moments that matter. Ten minutes
              now, a memory they keep for years.
            </p>

            <div className="final-cta__actions">
              <Button to={paths.shop} size="lg" trailingIcon="arrowRight">
                Create Your Gift
              </Button>

              <Link
                to={`${paths.home}#${sectionIds.gifts}`}
                className="final-cta__link group"
              >
                <span className="relative">
                  <span>Browse all gifts</span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 block h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-brand group-hover:scale-x-100"
                  />
                </span>
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform duration-200 ease-brand group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default FinalCTA
