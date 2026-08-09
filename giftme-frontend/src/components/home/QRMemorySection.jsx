import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import { images, memoryGallery } from '../../assets/images'
import { memoryLayers, scanFlow } from '../../data/home.js'
import { paths, sectionIds } from '../../app/paths.js'
import './QRMemorySection.css'

const FLOW_KEYS = {
  scan: { title: 'home.qrMemory.flow.scanTitle', description: 'home.qrMemory.flow.scanDescription' },
  open: { title: 'home.qrMemory.flow.openTitle', description: 'home.qrMemory.flow.openDescription' },
  relive: { title: 'home.qrMemory.flow.reliveTitle', description: 'home.qrMemory.flow.reliveDescription' },
}

const LAYER_LABEL_KEYS = {
  photos: 'home.qrMemory.layers.photos',
  video: 'home.qrMemory.layers.video',
  audio: 'home.qrMemory.layers.audio',
  message: 'home.qrMemory.layers.message',
}

/**
 * The one thing GiftMe sells that a print shop cannot.
 *
 * It is the page's first ink band, and that is the argument: after four ivory
 * screens the lights go down for the section that matters most, and the phone
 * preview becomes the brightest object on the page. Warm clay light behind it,
 * grain over the whole field, and the same hairline-and-numeral language as
 * every other section — dark, but not a different template.
 *
 * The copy stays emotional rather than technical. Nobody buys a QR code.
 */

/** Fixed waveform so the preview renders identically on every load. */
const WAVEFORM = [32, 64, 44, 82, 54, 96, 40, 72, 34, 88, 48, 62, 30, 76, 50]

function QRMemorySection() {
  const { t } = useTranslation()
  return (
    <section
      className="qr-memory"
      id={sectionIds.qrMemory}
      aria-labelledby="qr-memory-title"
    >
      <span aria-hidden="true" className="qr-memory__glow" />
      <span aria-hidden="true" className="grain grain--dark" />

      <Container className="qr-memory__inner">
        <Reveal className="qr-memory__content">
          <p className="eyebrow eyebrow--inverse">{t('home.qrMemory.eyebrow')}</p>

          <h2 id="qr-memory-title" className="qr-memory__title">
            <span>{t('home.qrMemory.titleLine1')}</span>
            <em>{t('home.qrMemory.titleLine2')}</em>
          </h2>

          <p className="qr-memory__lead">{t('home.qrMemory.lead')}</p>

          <ol className="qr-memory__flow">
            {scanFlow.map((step, index) => (
              <li key={step.id} className="qr-memory__flow-step">
                <span className="qr-memory__flow-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="qr-memory__flow-title">{t(FLOW_KEYS[step.id].title)}</span>
                  <span className="qr-memory__flow-text">
                    {t(FLOW_KEYS[step.id].description)}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <ul className="qr-memory__layers">
            {memoryLayers.map((layer) => (
              <li key={layer.id} className="qr-memory__layer">
                <Icon name={layer.icon} size={15} strokeWidth={1.5} />
                {t(LAYER_LABEL_KEYS[layer.id])}
              </li>
            ))}
          </ul>

          <div className="qr-memory__actions">
            <Button
              to={paths.product('qr-memory-experience')}
              variant="light"
              size="lg"
              trailingIcon="arrowRight"
            >
              {t('home.qrMemory.cta')}
            </Button>

            <p className="qr-memory__privacy">
              <Icon name="lock" size={15} strokeWidth={1.4} />
              {t('home.qrMemory.privacy')}
            </p>
          </div>
        </Reveal>

        <Reveal className="qr-memory__visual" delay={120}>
          <div className="qr-memory__gift">
            <div className="qr-memory__gift-media">
              <img
                src={images.customerGift}
                alt="A personalized photo puzzle and a matching mug, boxed together and ready to give"
                width="1200"
                height="1592"
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
              <span>{t('home.qrMemory.scanTag')}</span>
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
                <span className="qr-memory__screen-lock">{t('home.qrMemory.private')}</span>
              </div>

              <img
                className="qr-memory__screen-cover"
                src={images.memoryCover}
                alt=""
                width="760"
                height="1000"
                loading="lazy"
              />

              <p className="qr-memory__screen-note">{t('home.qrMemory.screenNote')}</p>

              <div className="qr-memory__screen-row">
                <span className="qr-memory__screen-play">
                  <Icon name="play" size={12} />
                </span>
                <span className="qr-memory__screen-label">{t('home.qrMemory.screenVideoLabel')}</span>
                <span className="qr-memory__screen-time">0:42</span>
              </div>

              <ul className="qr-memory__screen-gallery">
                {memoryGallery.map((source) => (
                  <li key={source}>
                    <img
                      src={source}
                      alt=""
                      width="400"
                      height="400"
                      loading="lazy"
                    />
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
