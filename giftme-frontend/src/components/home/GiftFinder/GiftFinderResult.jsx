import { useTranslation } from 'react-i18next'
import Button from '../../common/Button.jsx'
import { paths } from '../../../app/paths.js'
import { formatPriceShort } from '../../../lib/format.js'
import { productImage } from '../../../lib/productMedia.js'

/**
 * The answer to the consultation — an editorial preview, not a second card.
 * It sits directly on the panel it was found in: no border, no shadow, nothing
 * that would make it read as a separate object stacked on top.
 *
 * `ref` is here so the section can move focus onto the result once it appears.
 * Pressing "Find My Gift" replaces the control that was pressed, and focus
 * would otherwise fall back to the document.
 */
function GiftFinderResult({ product, reason, titleId, ref }) {
  const { t } = useTranslation()
  /** `product` is a live ProductResponse, so price and name are the real ones. */
  const image = productImage(product)

  return (
    <article
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="animate-rise"
    >
      <p className="flex items-center gap-3 text-[0.6875rem] font-medium tracking-[0.16em] text-ink-soft uppercase">
        <span aria-hidden="true" className="block h-px w-6 shrink-0 bg-clay" />
        {t('home.giftFinder.ourPick')}
      </p>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-6 sm:max-wide:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] wide:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
        <figure className="m-0 overflow-hidden rounded-(--radius-md) border border-line bg-bone">
          <img
            src={image.src}
            alt={image.alt}
            width="800"
            height="1000"
            loading="lazy"
            className="w-full [aspect-ratio:16/10] object-cover sm:[aspect-ratio:4/5]"
            style={{ objectPosition: image.position }}
          />
        </figure>

        <div className="flex min-w-0 flex-col items-start">
          <h3 id={titleId} className="text-[1.35rem] leading-tight sm:text-[1.5rem]">
            {product.name}
          </h3>

          <p className="mt-2.5 max-w-[46ch] text-[0.9rem] text-ink-soft">
            {reason}
          </p>

          <p className="mt-3.5 font-medium">{formatPriceShort(product.price)}</p>

          <Button
            to={paths.product(product.slug)}
            trailingIcon="arrowRight"
            className="mt-5 w-full sm:w-auto"
          >
            {t('home.giftFinder.customizeThisGift')}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default GiftFinderResult
