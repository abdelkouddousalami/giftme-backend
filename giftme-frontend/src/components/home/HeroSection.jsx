import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import { images } from '../../assets/images'
import { paths, sectionIds } from '../../app/paths.js'
import './HeroSection.css'

const assurances = [
  'Free personalization preview',
  'Cash on delivery',
  'Delivered in 3–5 days',
]

function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Container className="hero__inner">
        <div className="hero__content">
          <p className="eyebrow">More than a gift, a memory</p>

          <h1 id="hero-title" className="hero__title">
            Create a gift
            <em className="hero__title-accent">they will never forget.</em>
          </h1>

          <p className="hero__lead">
            Personalized gifts with QR memories that turn moments into lasting
            feelings.
          </p>

          <div className="hero__actions">
            <Button to={paths.shop} size="lg" trailingIcon="arrowRight">
              Create Your Gift
            </Button>
            <Button
              href={`#${sectionIds.featuredGifts}`}
              variant="secondary"
              size="lg"
            >
              Explore Gifts
            </Button>
          </div>

          <ul className="hero__assurances">
            {assurances.map((item) => (
              <li key={item} className="hero__assurance">
                <Icon name="check" size={16} strokeWidth={1.8} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual">
          <div className="hero__frame">
            <img
              src={images.heroPuzzle}
              alt="A sunset photo of two people, printed and cut as a personalized jigsaw puzzle"
              width="900"
              height="1080"
              fetchPriority="high"
            />
          </div>

          <img
            className="hero__piece"
            src={images.puzzlePiece}
            alt=""
            width="220"
            height="220"
          />

          <figure className="hero__tag">
            <img
              className="hero__tag-qr"
              src={images.qrCode}
              alt=""
              width="200"
              height="200"
            />
            <figcaption className="hero__tag-text">
              <span className="hero__tag-title">Scan to remember</span>
              <span className="hero__tag-detail">
                Photos, video &amp; a voice note
              </span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  )
}

export default HeroSection
