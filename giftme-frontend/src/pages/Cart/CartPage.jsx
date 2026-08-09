import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../../components/common/Button.jsx'
import Container from '../../components/common/Container.jsx'
import Icon from '../../components/common/Icon.jsx'
import SectionHeading from '../../components/common/SectionHeading.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import QuantityStepper from '../../components/ui/QuantityStepper.jsx'
import { paths } from '../../app/paths.js'
import { amountToFreeDelivery, estimateDeliveryFee } from '../../lib/delivery.js'
import { formatPrice, formatPriceShort } from '../../lib/format.js'
import { resolveMediaUrl } from '../../lib/media.js'
import { productImage } from '../../lib/productMedia.js'
import { useCart } from '../../store/CartContext.jsx'

/**
 * The cart.
 *
 * This page renders <CartContext> and nothing else. The context is the single
 * source of truth here on purpose: the backend has no cart resource — checkout
 * is one atomic `POST /api/orders` — so the basket lives in the browser as
 * *intent* (productId, quantity, customization), while every name, price, image
 * and stock number on this screen is re-read live from `GET /api/products/{id}`
 * each time the cart hydrates. Caching any of that here would create a second,
 * staler copy of the catalogue and let a shopper see a price the backend would
 * not honour.
 *
 * Nothing below invents a pricing rule either: the money on screen is arithmetic
 * over backend-supplied unit prices, and `POST /api/orders` recomputes all of it
 * server-side regardless — its answer is what the customer pays.
 */

/** Long personalization text is shown as an excerpt, never cut mid-word. */
function excerpt(value, max) {
  const text = String(value ?? '').trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** `textColor` is a free-text column on the backend; only render it as a colour
 *  when it actually is one. */
function hexSwatch(value) {
  return /^#[0-9a-f]{3,8}$/i.test(String(value ?? '').trim()) ? value.trim() : null
}

/**
 * What the shopper actually personalized — the reason this line is not just
 * "a mug". Every field read here is a real `CustomizationRequest` field.
 */
function PersonalizationSummary({ customization, productName }) {
  const { t } = useTranslation()
  if (!customization) return null

  const photo = resolveMediaUrl(customization.imageUrl)
  const swatch = hexSwatch(customization.textColor)

  const details = [
    ['for', t('cart.personalizationLabels.for'), customization.recipientName],
    ['occasion', t('cart.personalizationLabels.occasion'), customization.occasion],
    ['printedText', t('cart.personalizationLabels.printedText'), excerpt(customization.text, 90)],
    ['giftMessage', t('cart.personalizationLabels.giftMessage'), excerpt(customization.giftMessage, 110)],
    ['font', t('cart.personalizationLabels.font'), customization.font],
  ].filter(([, , value]) => Boolean(String(value ?? '').trim()))

  const marks = [
    customization.qrMemoryEnabled ? { icon: 'qr', label: t('cart.qrMemoryIncluded') } : null,
    customization.videoUrl ? { icon: 'message', label: t('cart.videoMessage') } : null,
    customization.audioUrl ? { icon: 'music', label: t('cart.voiceNote') } : null,
  ].filter(Boolean)

  if (!photo && details.length === 0 && marks.length === 0) return null

  return (
    <div className="mt-3.5 rounded-(--radius-md) border border-line bg-bone px-4 py-3.5">
      <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
        {t('cart.personalized')}
      </p>

      <div className="mt-2.5 flex max-sm:gap-3 sm:gap-4">
        {photo ? (
          // No preflight: <figure> keeps its user-agent margin unless reset.
          // `imagePosition` is free-form on the backend with no agreed semantics,
          // so this preview centres rather than guessing at it.
          <figure className="m-0 shrink-0">
            <img
              src={photo}
              alt={t('cart.artworkAlt', { name: productName })}
              loading="lazy"
              className="size-16 rounded-(--radius-sm) border border-line-strong bg-white object-cover"
            />
          </figure>
        ) : null}

        <div className="min-w-0 flex-1">
          {details.length > 0 ? (
            /* No preflight: <dl> keeps its UA block margin and <dd> its 40px indent. */
            <dl className="m-0 flex flex-col gap-1">
              {details.map(([key, label, value]) => (
                // Side by side the label column steals most of a 390px row and
                // squeezes a long excerpt down to a word per line, so below `sm`
                // the value gets the full width and the label sits above it.
                // Range-disjoint variants: `max-sm:` and `sm:` never both match.
                <div
                  key={key}
                  className="flex max-sm:flex-col max-sm:gap-0.5 sm:gap-2 [font-size:var(--text-xs)]"
                >
                  <dt className="shrink-0 text-ink-soft">{label}</dt>
                  {/* Deliberately not a flex row: the swatch has to ride along
                      with the last word of a wrapped excerpt, and as a flex
                      sibling it detaches and floats at the line's right edge. */}
                  <dd className="m-0 min-w-0 text-ink">
                    {value}
                    {key === 'printedText' && swatch ? (
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: swatch }}
                        className="ms-1.5 inline-block size-3 translate-y-0.5 rounded-(--radius-pill) border border-line-strong"
                      />
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {marks.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {marks.map((mark) => (
                <li
                  key={mark.label}
                  className="inline-flex items-center gap-1.5 text-olive-deep [font-size:var(--text-xs)]"
                >
                  <Icon name={mark.icon} size={14} className="shrink-0" />
                  {mark.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** A line whose product is still in the catalogue. */
function CartLineRow({ line, onQuantityChange, onRemove }) {
  const { t } = useTranslation()
  const product = line.product
  const image = productImage(product)
  const stock = Number(product.stock ?? 0)
  const soldOut = stock <= 0

  return (
    <li className="border-b border-line py-6">
      <div className="flex max-sm:gap-4 sm:gap-5">
        <Link to={paths.product(product.slug)} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <figure className="m-0 overflow-hidden rounded-(--radius-md) bg-bone max-sm:w-20 sm:w-28">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full [aspect-ratio:4/5] object-cover"
              style={{ objectPosition: image.position }}
            />
          </figure>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex max-sm:flex-col max-sm:gap-1 sm:items-start sm:justify-between sm:gap-5">
            <div className="min-w-0">
              <h3 className="text-[1.05rem] leading-snug">
                <Link
                  to={paths.product(product.slug)}
                  className="transition-colors duration-200 hover:text-burgundy"
                >
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-ink-soft [font-size:var(--text-sm)]">
                {t('cart.each', { price: formatPriceShort(product.price) })}
              </p>
            </div>

            <p className="shrink-0 font-medium [font-size:var(--text-sm)] sm:text-right">
              {formatPrice(line.lineTotal)}
            </p>
          </div>

          <PersonalizationSummary
            customization={line.customization}
            productName={product.name}
          />

          {line.exceedsStock ? (
            <p className="mt-3 rounded-(--radius-sm) border border-blush bg-burgundy-tint px-3.5 py-2.5 text-burgundy-deep [font-size:var(--text-xs)]">
              {soldOut
                ? t('cart.soldOutInCart')
                : t('cart.onlyLeftInCart', { stock, quantity: line.quantity })}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center max-sm:gap-3 sm:gap-5">
            <QuantityStepper
              value={line.quantity}
              onChange={(next) => onQuantityChange(line.lineId, next)}
              // The ceiling is the product's real backend stock, so the stepper
              // cannot build a basket `POST /api/orders` is guaranteed to reject.
              // Sold out is the one case with no valid value, so it locks instead.
              max={soldOut ? line.quantity : stock}
              disabled={soldOut}
              label={t('cart.quantityFor', { name: product.name })}
            />

            <button
              type="button"
              onClick={() => onRemove(line.lineId)}
              aria-label={t('cart.removeFrom', { name: product.name })}
              className="inline-flex items-center gap-1.5 text-ink-soft underline-offset-4 transition-colors duration-200 [font-size:var(--text-xs)] hover:text-burgundy hover:underline"
            >
              <Icon name="close" size={14} />
              <span aria-hidden="true">{t('cart.remove')}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * A line whose product 404'd or went inactive between adding and now. There is
 * no name, price or image to show — the backend no longer serves any — so the
 * row says exactly that, offers only removal, and is in no total.
 */
function UnavailableLineRow({ line, onRemove }) {
  const { t } = useTranslation()
  return (
    <li className="border-b border-line py-6">
      <div className="flex rounded-(--radius-md) border border-blush bg-burgundy-tint px-4 py-4 max-sm:flex-col max-sm:items-start max-sm:gap-3 sm:items-center sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-burgundy-deep [font-size:var(--text-sm)]">
            <Icon name="box" size={16} className="shrink-0" />
            {t('cart.unavailableTitle')}
          </p>
          <p className="mt-1.5 text-ink-soft [font-size:var(--text-xs)]">
            {t('cart.unavailableDetail', { id: line.productId, quantity: line.quantity })}
          </p>
        </div>

        {/* Two withdrawn gifts would otherwise give a screen reader two buttons
            both named just "Remove"; there is no product name left to borrow,
            so the id already shown above is what distinguishes them. */}
        <Button
          variant="quiet"
          size="sm"
          aria-label={t('cart.removeItemNumber', { id: line.productId })}
          onClick={() => onRemove(line.lineId)}
        >
          {t('cart.remove')}
        </Button>
      </div>
    </li>
  )
}

/** Holds a line's shape while its live product is still being read. */
function CartLineSkeleton() {
  return (
    <li aria-hidden="true" className="animate-pulse border-b border-line py-6">
      <div className="flex max-sm:gap-4 sm:gap-5">
        <div className="shrink-0 [aspect-ratio:4/5] rounded-(--radius-md) bg-sand max-sm:w-20 sm:w-28" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-1/2 rounded-(--radius-xs) bg-sand" />
          <div className="mt-3 h-3 w-24 rounded-(--radius-xs) bg-bone" />
          <div className="mt-5 h-16 w-full rounded-(--radius-md) bg-bone" />
          <div className="mt-4 h-10 w-32 rounded-(--radius-sm) bg-bone" />
        </div>
      </div>
    </li>
  )
}

/** The list itself. A skeleton stands in for any line the catalogue has not
 *  answered for yet — never for a line it has answered about. */
function CartLines({ lines, isUnresolved, refreshing, onQuantityChange, onRemove }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="sr-only">{t('cart.itemsHeading')}</h2>

      {refreshing ? (
        <output className="mb-3 block text-ink-soft [font-size:var(--text-xs)]">
          {t('cart.refreshing')}
        </output>
      ) : null}

      <ul className="border-t border-line">
        {lines.map((line) => {
          if (isUnresolved(line)) return <CartLineSkeleton key={line.lineId} />
          if (line.unavailable) {
            return <UnavailableLineRow key={line.lineId} line={line} onRemove={onRemove} />
          }
          return (
            <CartLineRow
              key={line.lineId}
              line={line}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          )
        })}
      </ul>
    </div>
  )
}

function OrderSummary({ subtotal, itemCount, priceable, checkoutBlocked, blockReason, busy }) {
  const { t } = useTranslation()
  const deliveryFee = estimateDeliveryFee(subtotal)
  const total = subtotal + deliveryFee
  const toFreeDelivery = amountToFreeDelivery(subtotal)

  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="nav:sticky nav:top-[calc(var(--header-height)+1.5rem)]"
    >
      <div className="rounded-(--radius-lg) border border-line-strong bg-white p-6 shadow-(--shadow-xs)">
        <h2 id="cart-summary-heading" className="text-[1.15rem]">
          {t('cart.summary.title')}
        </h2>

        <dl className="m-0 mt-5 flex flex-col gap-3 [font-size:var(--text-sm)]">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">
              {t('cart.summary.subtotal')}
              {itemCount > 0 ? <span> · {t('common.item', { count: itemCount })}</span> : null}
            </dt>
            {/* An em dash, not `0.00 MAD`: until the catalogue has answered there
                is no subtotal yet, and a confident zero would be a claim. */}
            <dd className="m-0 shrink-0 font-medium">{priceable ? formatPrice(subtotal) : '—'}</dd>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">{t('cart.summary.delivery')}</dt>
            <dd className="m-0 shrink-0 font-medium">
              {!priceable ? '—' : deliveryFee === 0 ? t('common.free') : formatPrice(deliveryFee)}
            </dd>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <dt className="font-display text-[1.05rem]">{t('cart.summary.total')}</dt>
            <dd className="m-0 shrink-0 font-display text-[1.15rem]">
              {priceable ? formatPrice(total) : '—'}
            </dd>
          </div>
        </dl>

        {/* MISSING API: there is no order-quote endpoint. `POST /api/orders` is the
            only thing that prices an order, and it does so by creating it — so the
            fee and total above are a preview computed in src/lib/delivery.js from
            the backend's two config values, and must always read as an estimate. */}
        <p className="mt-4 text-ink-soft [font-size:var(--text-xs)]">
          {t('cart.summary.estimateNote')}
        </p>

        {toFreeDelivery > 0 && priceable ? (
          <p className="mt-5 flex items-start gap-2.5 rounded-(--radius-sm) bg-olive-tint px-3.5 py-3 text-olive-deep [font-size:var(--text-xs)]">
            <Icon name="truck" size={15} className="mt-0.5 shrink-0" />
            <span>
              {t('cart.summary.freeDeliveryProgress', { amount: formatPriceShort(toFreeDelivery) })}
            </span>
          </p>
        ) : priceable ? (
          <p className="mt-5 flex items-start gap-2.5 rounded-(--radius-sm) bg-olive-tint px-3.5 py-3 text-olive-deep [font-size:var(--text-xs)]">
            <Icon name="check" size={15} className="mt-0.5 shrink-0" />
            <span>{t('cart.summary.freeDeliveryUnlocked')}</span>
          </p>
        ) : null}

        <div className="mt-6">
          {/* A disabled <Link> is still clickable, so a blocked checkout renders a
              real <button disabled> rather than a link that goes nowhere. */}
          {checkoutBlocked ? (
            <Button variant="primary" size="lg" className="btn--block" disabled>
              {busy ? t('cart.summary.checkingAvailability') : t('cart.summary.continueToCheckout')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="btn--block"
              to={paths.checkout}
              trailingIcon="arrowRight"
            >
              {t('cart.summary.continueToCheckout')}
            </Button>
          )}

          {/* No preflight: <output> keeps its UA `display: inline`, hence `block`.
              It carries an implicit role="status", so a newly blocked checkout is
              announced without stealing focus. */}
          {blockReason ? (
            <output className="mt-3 block text-center text-burgundy-deep [font-size:var(--text-xs)]">
              {blockReason}
            </output>
          ) : null}

          <p className="mt-4 text-center">
            <Link
              to={paths.shop}
              className="text-ink-soft underline-offset-4 transition-colors duration-200 [font-size:var(--text-xs)] hover:text-ink hover:underline"
            >
              {t('cart.continueShopping')}
            </Link>
          </p>
        </div>

        {/* COD is the only value the backend's PaymentMethod enum accepts. */}
        <p className="mt-6 flex items-center justify-center gap-2 border-t border-line pt-5 text-ink-soft [font-size:var(--text-xs)]">
          <Icon name="cash" size={15} className="shrink-0" />
          {t('cart.summary.payCod')}
        </p>
      </div>
    </aside>
  )
}

/**
 * The cart context reports its hydration failure as a bare string, so the
 * "server never answered" case arrives here as axios's own `Network Error` —
 * a library sentinel, not a sentence anyone should be shown. <ErrorState />
 * already writes proper copy for that case, but only when it is handed an
 * object carrying `isNetwork`, so recognise the sentinel and give it one.
 * Anything else is the backend's own `ApiResponse.message`, which is written
 * for a human and is passed through untouched.
 */
function asErrorStateInput(message) {
  const isNetwork = /^network error$/i.test(message) || /^timeout of /i.test(message)
  return { message, isNetwork }
}

/**
 * The one sentence under a blocked CTA, so it always names the fix the shopper
 * can actually perform. A sold-out line is deliberately separated from an
 * over-ordered one: its stepper is locked, so telling anyone to "lower the
 * quantity" would be advice with no control attached to it.
 */
function checkoutBlockReason(t, { pending, hydrationError, hasBlockedLine, hasSoldOutLine, hasStockIssue }) {
  // Before the first hydrate settles every line is momentarily product-less,
  // which is not a fault to report — the CTA already reads "Checking
  // availability…".
  if (pending) return null
  if (hydrationError) return t('cart.blockReasons.hydrationError')
  if (hasBlockedLine) return t('cart.blockReasons.unavailable')
  if (hasSoldOutLine) return t('cart.blockReasons.soldOut')
  if (hasStockIssue) return t('cart.blockReasons.stockIssue')
  return null
}

function CartPage() {
  const { t } = useTranslation()
  const {
    lines,
    availableLines,
    itemCount,
    subtotal,
    hydrating,
    hydrationError,
    unavailableIds,
    hasStockIssue,
    isEmpty,
    updateQuantity,
    removeItem,
    retryHydrate,
  } = useCart()

  // A line is only truthfully "no longer available" once GET /api/products/{id}
  // has actually answered 404/inactive for it — which is precisely the set the
  // context records in `unavailableIds`. `line.unavailable` is merely
  // "product is null", and a line is also product-less before the catalogue has
  // replied: on the first paint (the hydrate effect runs after it), and again
  // for any line still in flight while a newly added product re-triggers
  // hydration. Reading it literally tells a shopper their gift left the
  // catalogue when the server has simply not answered yet, so an unanswered
  // line is unresolved — it holds its shape and claims nothing.
  const unavailableIdSet = useMemo(() => new Set(unavailableIds.map(Number)), [unavailableIds])
  const isUnresolved = (line) => !line.product && !unavailableIdSet.has(Number(line.productId))

  const anyUnresolved = lines.some(isUnresolved)
  const pending = hydrating || anyUnresolved

  // Only lines the API has answered *about* can block checkout. A line whose
  // request failed outright is neither: that is a whole-cart failure and is
  // reported by the <ErrorState /> branch below instead.
  const hasBlockedLine = lines.some((line) => line.unavailable && !isUnresolved(line))
  const hasSoldOutLine = availableLines.some((line) => Number(line.product.stock ?? 0) <= 0)

  const checkoutBlocked =
    pending ||
    Boolean(hydrationError) ||
    hasBlockedLine ||
    hasStockIssue ||
    availableLines.length === 0

  const blockReason = checkoutBlockReason(t, {
    pending,
    hydrationError,
    hasBlockedLine,
    hasSoldOutLine,
    hasStockIssue,
  })

  const availableItemCount = availableLines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <section className="py-(--section-y)">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow={itemCount > 0 ? t('common.item', { count: itemCount }) : t('cart.yourBag')}
          title={
            <>
              {t('cart.titleLine1')} <em>{t('cart.titleEm')}</em>
            </>
          }
          description={t('cart.description')}
        />

        <div className="mt-10">
          {isEmpty ? (
            <EmptyState
              icon="bag"
              title={t('cart.emptyTitle')}
              description={t('cart.emptyDescription')}
              actionLabel={t('cart.browseGifts')}
              actionTo={paths.shop}
            />
          ) : hydrationError ? (
            <div className="flex flex-col items-center gap-5">
              <ErrorState
                error={asErrorStateInput(hydrationError)}
                onRetry={retryHydrate}
                title={t('cart.loadErrorTitle')}
                className="w-full"
              />
              <Link
                to={paths.shop}
                className="text-ink-soft underline-offset-4 transition-colors duration-200 [font-size:var(--text-sm)] hover:text-ink hover:underline"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          ) : (
            <div className="grid items-start max-nav:gap-10 nav:grid-cols-[minmax(0,1fr)_21.5rem] nav:gap-14">
              <CartLines
                lines={lines}
                isUnresolved={isUnresolved}
                refreshing={hydrating && lines.some((line) => line.product)}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />

              <OrderSummary
                subtotal={subtotal}
                itemCount={availableItemCount}
                priceable={!anyUnresolved && availableLines.length > 0}
                checkoutBlocked={checkoutBlocked}
                blockReason={blockReason}
                busy={pending}
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

export default CartPage
