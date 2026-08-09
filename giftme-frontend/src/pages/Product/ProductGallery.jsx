import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { productGallery } from '../../lib/productMedia.js'

/**
 * The product's imagery: one large view plus a thumbnail strip.
 *
 * Everything shown comes from `productGallery(product)` — `mainImage` first,
 * then the real `galleryImages` array. `mainImage` is nullable in the schema
 * (and null for every seeded product), so the first entry can be the brand
 * fallback photograph; when it is, the caption says so rather than passing
 * stock photography off as this product's own.
 *
 * The strip is a list of real <button>s, so it is reachable with Tab and
 * operable with Enter/Space at no extra cost. A product with a single image
 * gets no strip at all — a one-item picker is noise.
 */
function ProductGallery({ product }) {
  const { t } = useTranslation()
  const images = useMemo(() => productGallery(product), [product])
  const [index, setIndex] = useState(0)

  // A new product is a new gallery: never leave the strip pointing at the
  // previous product's third photo.
  useEffect(() => {
    setIndex(0)
  }, [product?.id])

  const safeIndex = Math.min(index, images.length - 1)
  const active = images[safeIndex]

  if (!active) return null

  return (
    <div>
      {/* No preflight: <figure> keeps its user-agent margin unless reset. */}
      <figure className="m-0">
        <div className="overflow-hidden rounded-(--radius-lg) bg-bone">
          <img
            key={active.src}
            src={active.src}
            alt={active.alt}
            loading="eager"
            className="w-full [aspect-ratio:4/5] object-cover motion-safe:animate-fade"
            style={{ objectPosition: active.position }}
          />
        </div>

        {active.isFallback ? (
          <figcaption className="mt-3 text-ink-soft [font-size:var(--text-xs)]">
            {t('product.gallery.fallbackCaption')}
          </figcaption>
        ) : null}
      </figure>

      {images.length > 1 ? (
        <ul className="mt-4 flex flex-wrap max-sm:gap-2.5 sm:gap-3">
          {images.map((image, position) => {
            const selected = position === safeIndex
            return (
              // Keyed by position, not by src: an admin can legitimately upload
              // the same file as both mainImage and a galleryImage, and two
              // <li>s sharing a key would make React reuse the wrong node.
              <li key={position}>
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-pressed={selected}
                  className={[
                    'block overflow-hidden rounded-(--radius-sm) border transition-colors duration-200',
                    selected ? 'border-ink' : 'border-line hover:border-line-strong',
                  ].join(' ')}
                >
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    className="size-[4.5rem] object-cover"
                    style={{ objectPosition: image.position }}
                  />
                  <span className="sr-only">
                    {t('product.gallery.showImage', { index: position + 1, total: images.length })}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default ProductGallery
