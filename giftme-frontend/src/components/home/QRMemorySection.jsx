import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import { images, memoryGallery } from '../../assets/images'
import { memoryLayers, scanFlow } from '../../data/home.js'
import { paths, sectionIds } from '../../app/paths.js'
import './QRMemorySection.css'

/** Fixed waveform so the preview renders identically on every load. */
const WAVEFORM = [32, 64, 44, 82, 54, 96, 40, 72, 34, 88, 48, 62, 30, 76, 50]

function QRMemorySection() {
  return (
    <section
      className="qr-memory"
      id={sectionIds.qrMemory}
      aria-labelledby="qr-memory-title"
    >
      <Container className="qr-memory__inner">
        <Reveal className="qr-memory__content">
          <p className="eyebrow">The QR memory</p>

          <h2 id="qr-memory-title" className="qr-memory__title">
            Some memories deserve <em>more than a photo.</em>
          </h2>

          <p className="qr-memory__lead">
            Add a private digital memory to your gift and let them discover your
            story when they scan the QR code.
          </p>

          <ol className="qr-memory__flow">
            {scanFlow.map((step, index) => (
              <li key={step.id} className="qr-memory__flow-step">
                <span className="qr-memory__flow-index" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <span className="qr-memory__flow-title">{step.title}</span>
                  <span className="qr-memory__flow-text">
                    {step.description}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <ul className="qr-memory__layers">
            {memoryLayers.map((layer) => (
              <li key={layer.id} className="qr-memory__layer">
                <Icon name={layer.icon} size={16} strokeWidth={1.6} />
                {layer.label}
              </li>
            ))}
          </ul>

          <Button
            to={paths.product('qr-memory-experience')}
            variant="sage"
            size="lg"
            trailingIcon="arrowRight"
          >
            Discover QR Memory
          </Button>
        </Reveal>

        <Reveal className="qr-memory__visual" delay={120}>
          <div className="qr-memory__gift">
            <div className="qr-memory__gift-media">
              <img
                src={images.heroPuzzle}
                alt="A personalized puzzle of a couple at sunset"
                width="900"
                height="1080"
                loading="lazy"
              />
            </div>

            <p className="qr-memory__tag">
              <img
                src={images.qrCode}
                alt=""
                width="200"
                height="200"
                loading="lazy"
              />
              <span>Scan the tag on the gift</span>
            </p>
          </div>

          <div
            className="qr-memory__phone"
            role="img"
            aria-label="Preview of a private memory page on a phone: a cover photo, a written message, a video, a small photo gallery and a voice note."
          >
            <div className="qr-memory__screen">
              <div className="qr-memory__screen-head">
                <span className="qr-memory__screen-brand">GiftMe</span>
                <span className="qr-memory__screen-lock">Private</span>
              </div>

              <img
                className="qr-memory__screen-cover"
                src={images.memoryCover}
                alt=""
                width="760"
                height="1000"
                loading="lazy"
              />

              <p className="qr-memory__screen-note">
                Two years, and I&rsquo;d still choose that evening again.
              </p>

              <div className="qr-memory__screen-row">
                <span className="qr-memory__screen-play">
                  <Icon name="play" size={12} />
                </span>
                <span className="qr-memory__screen-label">Our evening</span>
                <span className="qr-memory__screen-time">0:42</span>
              </div>

              <ul className="qr-memory__screen-gallery">
                {memoryGallery.map((source) => (
                  <li key={source}>
                    <img src={source} alt="" width="400" height="400" loading="lazy" />
                  </li>
                ))}
              </ul>

              <div className="qr-memory__screen-row">
                <span className="qr-memory__screen-play">
                  <Icon name="music" size={12} strokeWidth={1.8} />
                </span>
                <span className="qr-memory__wave">
                  {WAVEFORM.map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </span>
                <span className="qr-memory__screen-time">1:12</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default QRMemorySection
