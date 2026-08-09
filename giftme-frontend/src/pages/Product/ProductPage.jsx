import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Button from '../../components/common/Button.jsx'
import Container from '../../components/common/Container.jsx'
import Icon from '../../components/common/Icon.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import QuantityStepper from '../../components/ui/QuantityStepper.jsx'

import ProductGallery from './ProductGallery.jsx'
import PersonalizationPanel, {
  EMPTY_CUSTOMIZATION,
  toCustomizationRequest,
} from './PersonalizationPanel.jsx'

import { getProductBySlug } from '../../api/products.js'
import { useAsync } from '../../hooks/useAsync.js'
import { useCart } from '../../store/CartContext.jsx'
import { paths } from '../../app/paths.js'
import { formatPrice, formatPriceShort } from '../../lib/format.js'
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  amountToFreeDelivery,
} from '../../lib/delivery.js'

/**
 * One gift, in full — `GET /api/products/slug/{slug}`.
 *
 * Everything on this page is a field of `ProductResponse`. The backend has no
 * ratings, no review count, no compare-at price and no variant model, so none
 * of those appear here in any form; the two states worth showing come from
 * `stock` and `customizationEnabled`.
 *
 * MISSING API: there is no reviews resource (no entity, no controller), so the
 * page shows no rating, no star row and no "loved by N customers" line. Adding
 * one means adding `GET /api/products/{id}/reviews` backend-side first.
 */

const LOW_STOCK_THRESHOLD = 5

/** Blank lines are paragraph breaks; a lone newline is not. */
function splitParagraphs(description) {
  return (description ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
}

const GRID_CLASS =
  'grid items-start max-nav:gap-10 nav:gap-14 nav:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'

function ProductPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const { data: product, error, loading, run } = useAsync(() => getProductBySlug(slug), [slug])
  const { addItem } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState(EMPTY_CUSTOMIZATION)
  const [added, setAdded] = useState(null)

  // A different gift is a different personalization: never carry a draft — or a
  // stale "added to cart" note — across a slug change.
  useEffect(() => {
    setQuantity(1)
    setCustomization(EMPTY_CUSTOMIZATION)
    setAdded(null)
  }, [slug])

  const stock = Number(product?.stock ?? 0)

  // Stock can drop between page loads; pull the stepper back down with it so the
  // basket never asks for more than the order endpoint would accept.
  useEffect(() => {
    if (stock > 0) setQuantity((current) => Math.min(current, stock))
  }, [stock])

  const paragraphs = useMemo(() => splitParagraphs(product?.description), [product?.description])

  if (loading) {
    return (
      <Container>
        <div className="max-nav:py-10 nav:py-14">
          <p role="status" className="sr-only">
            {t('common.loading')}
          </p>
          <ProductPageSkeleton />
        </div>
      </Container>
    )
  }

  // A slug nobody has ever heard of is not a failure of the site — it is a wrong
  // turn, and it gets its own state rather than the red "something went wrong".
  if (error?.status === 404) {
    return (
      <Container>
        <div className="max-nav:py-14 nav:py-20">
          <EmptyState
            icon="search"
            title={t('product.notFoundTitle')}
            description={t('product.notFoundDescription', { slug })}
            actionLabel={t('product.browseAll')}
            actionTo={paths.shop}
          />
        </div>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container>
        <div className="max-nav:py-14 nav:py-20">
          <ErrorState error={error} onRetry={run} title={t('product.loadErrorTitle')} />
        </div>
      </Container>
    )
  }

  // Unlike GET /api/products, the slug lookup is NOT filtered by `active`
  // (ProductServiceImpl.getBySlug reads the row straight out of the repository),
  // so a withdrawn product stays reachable from a bookmark or an old link —
  // while POST /api/orders rejects it outright with VALIDATION_ERROR. Say so
  // here instead of offering an Add-to-cart the backend would refuse.
  const withdrawn = product.active === false
  const soldOut = !withdrawn && stock <= 0
  const lowStock = !withdrawn && !soldOut && stock <= LOW_STOCK_THRESHOLD
  const canOrder = !withdrawn && !soldOut
  const unitPrice = Number(product.price)
  const lineSubtotal = unitPrice * quantity
  const toFreeDelivery = amountToFreeDelivery(lineSubtotal)

  const handleQuantity = (next) => {
    setQuantity(next)
    setAdded(null)
  }

  const handleCustomization = (next) => {
    setCustomization(next)
    setAdded(null)
  }

  const handleAdd = () => {
    const request = product.customizationEnabled ? toCustomizationRequest(customization) : null
    addItem(product, { quantity, customization: request })
    // Deliberately no redirect: the shopper may want a second one, personalized
    // differently. The confirmation offers both ways out instead.
    setAdded({ quantity, qrMemoryEnabled: Boolean(request?.qrMemoryEnabled) })
  }

  return (
    <div className="pb-(--section-y)">
      <Container>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft max-nav:pt-5 nav:pt-8 [font-size:var(--text-xs)]"
        >
          <Link to={paths.home} className="transition-colors duration-200 hover:text-ink">
            {t('product.home')}
          </Link>
          <Icon name="chevronRight" size={13} className="rtl:rotate-180" />
          <Link to={paths.shop} className="transition-colors duration-200 hover:text-ink">
            {t('product.gifts')}
          </Link>
          {product.category ? (
            <>
              <Icon name="chevronRight" size={13} className="rtl:rotate-180" />
              <Link
                to={paths.category(product.category)}
                className="transition-colors duration-200 hover:text-ink"
              >
                {product.category}
              </Link>
            </>
          ) : null}
          <Icon name="chevronRight" size={13} className="rtl:rotate-180" />
          <span aria-current="page" className="text-ink">
            {product.name}
          </span>
        </nav>

        <div className={`${GRID_CLASS} max-nav:pt-8 nav:pt-12`}>
          <div className="nav:sticky nav:top-[calc(var(--header-height)+1.75rem)]">
            <ProductGallery product={product} />
          </div>

          <div>
            {product.category ? (
              <p className="eyebrow">
                <Link to={paths.category(product.category)}>{product.category}</Link>
              </p>
            ) : null}

            <h1 className="mt-4 [font-size:var(--text-display-2)]">{product.name}</h1>

            <p className="mt-4 [font-size:var(--text-xl)]">{formatPrice(product.price)}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {withdrawn ? (
                <Badge tone="ink">{t('product.noLongerAvailable')}</Badge>
              ) : soldOut ? (
                <Badge tone="ink">{t('product.soldOut')}</Badge>
              ) : lowStock ? (
                <Badge tone="clay">{t('product.onlyLeft', { count: stock })}</Badge>
              ) : (
                <Badge tone="olive">{t('product.inStock')}</Badge>
              )}

              {product.customizationEnabled ? <Badge tone="neutral">{t('product.personalized')}</Badge> : null}
            </div>

            {product.shortDescription ? (
              <p className="mt-6 max-w-[52ch] text-ink-soft [font-size:var(--text-lg)]">
                {product.shortDescription}
              </p>
            ) : null}

            {product.customizationEnabled && !withdrawn ? (
              <section
                aria-labelledby="personalize-heading"
                className="mt-9 border-t border-line pt-9"
              >
                <h2 id="personalize-heading" className="[font-size:var(--text-display-3)]">
                  {t('product.personalizeIt')}
                </h2>
                <p className="mt-2.5 mb-7 max-w-[52ch] text-ink-soft [font-size:var(--text-sm)]">
                  {t('product.personalizeHint')}
                </p>

                <PersonalizationPanel
                  value={customization}
                  onChange={handleCustomization}
                  product={product}
                />
              </section>
            ) : null}

            <div className="mt-9 border-t border-line pt-9">
              <div className="flex flex-wrap items-center gap-4">
                <QuantityStepper
                  value={quantity}
                  onChange={handleQuantity}
                  min={1}
                  max={Math.max(1, stock)}
                  disabled={!canOrder}
                  label={t('product.quantityOf', { name: product.name })}
                />

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAdd}
                  disabled={!canOrder}
                  className="grow"
                >
                  {withdrawn ? t('product.unavailable') : soldOut ? t('product.soldOut') : t('product.addToCart')}
                </Button>
              </div>

              {canOrder ? (
                <p className="mt-3 text-ink-soft [font-size:var(--text-sm)]">
                  {quantity} × {formatPriceShort(unitPrice)} ={' '}
                  <span className="text-ink">{formatPrice(lineSubtotal)}</span>
                </p>
              ) : withdrawn ? (
                <p className="mt-3 text-ink-soft [font-size:var(--text-sm)]">
                  {t('product.withdrawnNotice')}{' '}
                  <Link to={paths.shop} className="text-burgundy underline underline-offset-4">
                    {t('product.seeWhatElse')}
                  </Link>
                  .
                </p>
              ) : (
                /* MISSING API: there is no back-in-stock / notify-me endpoint, so
                   we promise nothing we cannot deliver and point at the catalog. */
                <p className="mt-3 text-ink-soft [font-size:var(--text-sm)]">
                  {t('product.soldOutNotice')}{' '}
                  <Link to={paths.shop} className="text-burgundy underline underline-offset-4">
                    {t('product.seeWhatElse')}
                  </Link>
                  .
                </p>
              )}

              <div aria-live="polite">
                {added ? (
                  <div className="mt-5 rounded-(--radius-md) border border-line-strong bg-white px-5 py-4">
                    <p className="flex items-center gap-2 font-medium">
                      <Icon name="check" size={16} className="text-olive-deep" />
                      {t('product.addedToCart')}
                    </p>
                    <p className="mt-1.5 text-ink-soft [font-size:var(--text-sm)]">
                      {t('product.addedSummary', {
                        quantity: added.quantity,
                        name: product.name,
                        withMemory: added.qrMemoryEnabled ? t('product.withMemory') : '',
                      })}
                    </p>

                    {added.qrMemoryEnabled ? (
                      <p className="mt-2 text-ink-soft [font-size:var(--text-sm)]">
                        {t('product.memoryNote')}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="primary" size="sm" to={paths.cart}>
                        {t('product.viewCart')}
                      </Button>
                      <Button variant="quiet" size="sm" to={paths.shop}>
                        {t('product.keepShopping')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <ul className="mt-9 flex flex-col gap-3.5 border-t border-line pt-9 [font-size:var(--text-sm)]">
              <li className="flex gap-3">
                <Icon name="truck" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
                <span>
                  {toFreeDelivery > 0
                    ? t('product.deliveryEstimate', {
                        fee: formatPriceShort(DELIVERY_FEE),
                        threshold: formatPriceShort(FREE_DELIVERY_THRESHOLD),
                      })
                    : t('product.deliveryFree')}
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="cash" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
                <span>{t('product.cod')}</span>
              </li>
              <li className="flex gap-3">
                <Icon name="box" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
                <span>
                  {t('product.trackingLine')}{' '}
                  <Link to={paths.track} className="text-burgundy underline underline-offset-4">
                    {t('product.trackingPage')}
                  </Link>
                  .
                </span>
              </li>
            </ul>

            {/* The delivery figures above are a preview computed from two backend
                config values (see lib/delivery.js); only POST /api/orders returns
                the fee the customer is actually charged. */}
            <p className="mt-4 text-ink-soft [font-size:var(--text-xs)]">
              {t('product.deliveryFootnote')}
            </p>

            {paragraphs.length > 0 ? (
              <section aria-labelledby="about-heading" className="mt-9 border-t border-line pt-9">
                <h2 id="about-heading" className="[font-size:var(--text-display-3)]">
                  {t('product.aboutThisGift')}
                </h2>
                <div className="mt-4 flex flex-col gap-4 text-ink-soft [font-size:var(--text-sm)]">
                  {paragraphs.map((paragraph, index) => (
                    // Static, never-reordered prose: the position is the only
                    // stable identity (two paragraphs can share an opening line).
                    <p key={index} className="max-w-[62ch] whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  )
}

/** Holds the two-column shape while the request is in flight. */
function ProductPageSkeleton() {
  return (
    <div aria-hidden="true" className={`${GRID_CLASS} animate-pulse`}>
      <div>
        <div className="w-full [aspect-ratio:4/5] rounded-(--radius-lg) bg-sand" />
        <div className="mt-4 flex gap-3">
          {[0, 1, 2].map((thumb) => (
            <div key={thumb} className="size-[4.5rem] rounded-(--radius-sm) bg-bone" />
          ))}
        </div>
      </div>

      <div>
        <div className="h-3 w-24 rounded-(--radius-xs) bg-bone" />
        <div className="mt-5 h-8 w-3/4 rounded-(--radius-xs) bg-sand" />
        <div className="mt-4 h-5 w-28 rounded-(--radius-xs) bg-sand" />
        <div className="mt-6 h-4 w-full rounded-(--radius-xs) bg-bone" />
        <div className="mt-2.5 h-4 w-5/6 rounded-(--radius-xs) bg-bone" />

        <div className="mt-9 border-t border-line pt-9">
          <div className="flex gap-4">
            <div className="h-10 w-32 rounded-(--radius-sm) bg-bone" />
            <div className="h-10 grow rounded-(--radius-sm) bg-sand" />
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3.5 border-t border-line pt-9">
          <div className="h-3.5 w-2/3 rounded-(--radius-xs) bg-bone" />
          <div className="h-3.5 w-1/2 rounded-(--radius-xs) bg-bone" />
          <div className="h-3.5 w-3/5 rounded-(--radius-xs) bg-bone" />
        </div>
      </div>
    </div>
  )
}

export default ProductPage
