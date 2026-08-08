import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import { getPublicMemory } from '../../api/memory.js'
import { extractErrorMessage } from '../../lib/api.js'
import { resolveMediaUrl } from '../../lib/media.js'
import { paths } from '../../app/paths.js'
import './PublicMemoryPage.css'

/**
 * The page a QR code on a physical gift unlocks. Reachable only by knowing the
 * unguessable publicCode - no login, no navigation into it from elsewhere in
 * the app. Every media block (video/gallery/audio/music) is optional and only
 * renders if the admin actually attached one when building the memory.
 */
function PublicMemoryPage() {
  const { publicCode } = useParams()
  const [memory, setMemory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    getPublicMemory(publicCode)
      .then((data) => {
        if (!cancelled) setMemory(data)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [publicCode])

  if (isLoading) {
    return (
      <section className="memory-page">
        <Container size="narrow" className="memory-page__state">
          <span className="memory-page__spinner" aria-hidden="true" />
          <p>Opening your memory…</p>
        </Container>
      </section>
    )
  }

  if (error || !memory) {
    return (
      <section className="memory-page">
        <Container size="narrow" className="memory-page__state memory-page__state--error">
          <p className="eyebrow">Memory not found</p>
          <h1 className="memory-page__error-title">
            This link didn&rsquo;t <em>open anything.</em>
          </h1>
          <p className="memory-page__error-lead">
            The code may be mistyped, or the person who made this memory hasn&rsquo;t published it
            yet. Double-check the QR code or link and try again.
          </p>
          <Button to={paths.home} size="lg" trailingIcon="arrowRight">
            Back to home
          </Button>
        </Container>
      </section>
    )
  }

  const { title, message, mainImage, gallery, videoUrl, audioUrl, musicUrl } = memory
  const cover = resolveMediaUrl(mainImage)

  return (
    <section className="memory-page">
      <Container size="narrow" className="memory-page__inner">
        <p className="eyebrow memory-page__eyebrow">
          <Icon name="heart" size={14} strokeWidth={1.8} />
          A private memory, just for you
        </p>

        <h1 className="memory-page__title">{title}</h1>

        {cover && (
          <div className="memory-page__cover">
            <img src={cover} alt="" loading="eager" />
          </div>
        )}

        {message && <p className="memory-page__message">{message}</p>}

        {videoUrl && (
          <div className="memory-page__block">
            <p className="memory-page__block-label">
              <Icon name="play" size={15} /> A video for you
            </p>
            <video className="memory-page__video" src={resolveMediaUrl(videoUrl)} controls poster={cover} playsInline />
          </div>
        )}

        {gallery && gallery.length > 0 && (
          <div className="memory-page__block">
            <p className="memory-page__block-label">
              <Icon name="photo" size={15} /> Photos
            </p>
            <ul className="memory-page__gallery">
              {gallery.map((src) => (
                <li key={src}>
                  <a href={resolveMediaUrl(src)} target="_blank" rel="noreferrer">
                    <img src={resolveMediaUrl(src)} alt="" loading="lazy" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {audioUrl && (
          <div className="memory-page__block">
            <p className="memory-page__block-label">
              <Icon name="message" size={15} /> A voice message
            </p>
            <audio className="memory-page__audio" src={resolveMediaUrl(audioUrl)} controls />
          </div>
        )}

        {musicUrl && (
          <div className="memory-page__block">
            <p className="memory-page__block-label">
              <Icon name="music" size={15} strokeWidth={1.8} /> Their song
            </p>
            <audio className="memory-page__audio" src={resolveMediaUrl(musicUrl)} controls />
          </div>
        )}

        <p className="memory-page__signature">Made with GiftMe</p>
      </Container>
    </section>
  )
}

export default PublicMemoryPage
