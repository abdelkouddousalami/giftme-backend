import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../common/Icon.jsx'
import Badge from './Badge.jsx'
import { paths } from '../../app/paths.js'
import { formatPriceShort } from '../../lib/format.js'
import { productImage } from '../../lib/productMedia.js'

/**
 * One product, everywhere it appears — the shop grid, the home page, the
 * "you might also like" strip. Every field on it is a real
 * `ProductResponse` field; nothing is decorated in.
 *
 * Stock drives the only two states worth showing a shopper before they click:
 * sold out (they cannot order it) and nearly gone (they should hurry). Both
 * read `product.stock` directly.
 */

const LOW_STOCK_THRESHOLD = 5

function ProductCard({ product, priority = false }) {
  const { t } = useTranslation()
  const image = productImage(product)
  const soldOut = product.stock <= 0
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD

  return (
    <article className="group h-full">
      <Link to={paths.product(product.slug)} className="flex h-full flex-col">
        {/* No preflight: <figure> keeps its UA margin unless reset. */}
        <figure className="relative m-0 overflow-hidden rounded-(--radius-md) bg-bone">
          <img
            src={image.src}
            alt={image.alt}
            loading={priority ? 'eager' : 'lazy'}
            className={[
              'w-full [aspect-ratio:4/5] object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]',
              soldOut ? 'opacity-60' : '',
            ].join(' ')}
            style={{ objectPosition: image.position }}
          />

          {soldOut ? (
            <span className="absolute top-3 start-3">
              <Badge tone="ink">{t('product.soldOut')}</Badge>
            </span>
          ) : lowStock ? (
            <span className="absolute top-3 start-3">
              <Badge tone="clay">{t('product.onlyLeft', { count: product.stock })}</Badge>
            </span>
          ) : product.customizationEnabled ? (
            <span className="absolute top-3 start-3">
              <Badge tone="ink">{t('product.personalized')}</Badge>
            </span>
          ) : null}
        </figure>

        <div className="pb-6">
          <h3 className="mt-5 text-[1.15rem] leading-snug max-sm:text-[1.05rem] sm:text-[1.3rem]">
            {product.name}
          </h3>

          {product.shortDescription ? (
            <p className="mt-2.5 max-w-[34ch] text-ink-soft max-sm:hidden [font-size:var(--text-sm)]">
              {product.shortDescription}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex justify-between border-t border-line pt-4 max-sm:flex-col max-sm:items-start max-sm:gap-2.5 sm:items-center sm:gap-3">
          <span className="text-[0.6875rem] font-medium tracking-[0.12em] text-ink-soft uppercase">
            {formatPriceShort(product.price)}
          </span>

          <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-burgundy">
            {soldOut ? t('common.view') : t('common.personalize')}
            <Icon
              name="arrowRight"
              size={15}
              className="transition-transform duration-300 ease-brand group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            />
          </span>
        </div>
      </Link>
    </article>
  )
}

/** Matching skeleton, so a loading grid holds the same shape the data will fill. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-full animate-pulse flex-col">
      <div className="w-full [aspect-ratio:4/5] rounded-(--radius-md) bg-sand" />
      <div className="mt-5 h-4 w-3/4 rounded-(--radius-xs) bg-sand" />
      <div className="mt-3 h-3 w-full rounded-(--radius-xs) bg-bone" />
      <div className="mt-auto border-t border-line pt-4">
        <div className="h-3 w-24 rounded-(--radius-xs) bg-sand" />
      </div>
    </div>
  )
}

export default ProductCard
