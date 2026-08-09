import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import Badge, { statusTone } from '../../components/ui/Badge.jsx'
import { formatDate, formatDateTime, formatPrice, orderStatusLabel } from '../../lib/format.js'
import { resolveMediaUrl } from '../../lib/media.js'
import { paths } from '../../app/paths.js'

/**
 * The page an order lands on the moment `POST /api/orders` succeeds.
 *
 * Every figure here comes off the OrderResponse the backend just returned, and
 * those are the authoritative ones — the cart and checkout only ever showed a
 * preview. Nothing on this page is recomputed client-side.
 *
 * MISSING API: there is no customer-facing `GET /api/orders/{id}` (order reads
 * live under `/api/admin/orders/**`, which the storefront must never call), so
 * the response cannot be re-fetched. It arrives once, in router state. A reload
 * or a direct visit therefore has nothing to show, and the recovery state below
 * sends the shopper to `GET /api/tracking/{trackingCode}` — the one public read
 * path — rather than inventing an order.
 */

/** The Customization fields worth repeating back, in the order they read best. */
function personalizationDetails(t, customization) {
  if (!customization) return []
  const details = []
  if (customization.occasion) {
    details.push({ label: t('orderConfirmed.occasion'), value: customization.occasion })
  }
  if (customization.recipientName) {
    details.push({ label: t('orderConfirmed.for'), value: customization.recipientName })
  }
  if (customization.text) {
    details.push({ label: t('orderConfirmed.printedText'), value: customization.text })
  }
  if (customization.font) details.push({ label: t('orderConfirmed.font'), value: customization.font })
  if (customization.giftMessage) {
    details.push({ label: t('orderConfirmed.giftMessage'), value: customization.giftMessage })
  }
  // imageUrl is deliberately absent: it is rendered as the artwork itself below.
  if (customization.videoUrl) {
    details.push({ label: t('orderConfirmed.video'), value: t('orderConfirmed.attached') })
  }
  if (customization.audioUrl) {
    details.push({ label: t('orderConfirmed.voiceNote'), value: t('orderConfirmed.attached') })
  }
  return details
}

/**
 * The artwork the shopper uploaded, read back to them.
 *
 * `imageUrl` is whatever `POST /api/uploads/image` returned; if that file has
 * since gone missing there is nothing honest to draw, so the figure removes
 * itself rather than leaving a broken-image box on a confirmation page.
 * `imagePosition` is free-form on the backend with no agreed semantics, so
 * this keepsake thumbnail centres rather than guessing at it.
 */
function Personalization({ item }) {
  const { t } = useTranslation()
  const [artworkFailed, setArtworkFailed] = useState(false)

  const details = personalizationDetails(t, item.customization)
  const src = resolveMediaUrl(item.customization?.imageUrl)
  const photo = artworkFailed ? undefined : src

  if (!photo && details.length === 0) return null

  return (
    <div className="mt-4 flex gap-4 rounded-(--radius-md) bg-bone px-4 py-4">
      {photo ? (
        // No preflight: <figure> keeps its user-agent margin unless reset.
        <figure className="m-0 shrink-0">
          <img
            src={photo}
            alt={t('cart.artworkAlt', { name: item.productName })}
            loading="lazy"
            onError={() => setArtworkFailed(true)}
            className="size-16 rounded-(--radius-sm) border border-line-strong bg-white object-cover"
          />
        </figure>
      ) : null}

      {details.length > 0 ? (
        /* No preflight: <dl> keeps its UA block margin and <dd> its 40px indent. */
        <dl className="m-0 flex min-w-0 flex-1 flex-col gap-2">
          {details.map((detail) => (
            <div key={detail.label} className="flex gap-3 [font-size:var(--text-xs)]">
              <dt className="w-24 shrink-0 text-ink-soft">{detail.label}</dt>
              <dd className="m-0 min-w-0 text-ink">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
      <dt className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
        {label}
      </dt>
      <dd className="m-0 text-ink [font-size:var(--text-sm)]">{value}</dd>
    </div>
  )
}

function OrderItem({ item }) {
  const { t } = useTranslation()
  const memoryCode = item.customization?.memoryPublicCode

  return (
    <li className="border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[1.05rem] text-ink">{item.productName}</p>
        <p className="shrink-0 text-ink [font-size:var(--text-sm)]">{formatPrice(item.totalPrice)}</p>
      </div>

      <p className="mt-1 text-ink-soft [font-size:var(--text-sm)]">
        {formatPrice(item.unitPrice)} × {item.quantity}
      </p>

      <Personalization item={item} />

      {memoryCode ? (
        <div className="mt-4 flex flex-col gap-3 rounded-(--radius-md) border border-blush bg-burgundy-tint px-5 py-5">
          <p className="flex items-center gap-2.5 text-[0.6875rem] font-medium tracking-[0.14em] text-burgundy-deep uppercase">
            <Icon name="qr" size={15} className="shrink-0" />
            {t('orderConfirmed.memoryCreated')}
          </p>
          <p className="font-display text-[1.05rem] text-ink">{t('orderConfirmed.memoryHeadline')}</p>
          <p className="text-ink-soft [font-size:var(--text-sm)]">{t('orderConfirmed.memoryLive')}</p>
          <div>
            <Button variant="outline" size="sm" to={paths.memory(memoryCode)} trailingIcon="arrowRight">
              {t('orderConfirmed.openMemory')}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  )
}

function OrderConfirmedPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const order = location.state?.order ?? null

  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), 2400)
    return () => clearTimeout(timer)
  }, [copied])

  // Router state is client-supplied, so nothing below assumes more of it than
  // the backend actually returns — including that `items` is a list at all.
  const items = useMemo(() => (Array.isArray(order?.items) ? order.items : []), [order])

  const memoryCount = useMemo(
    () => items.filter((item) => item.customization?.memoryPublicCode).length,
    [items],
  )

  async function copyTrackingCode() {
    try {
      // Absent on insecure origins, which the catch below turns into an
      // instruction rather than a silent no-op.
      await navigator.clipboard.writeText(order.trackingCode)
      setCopyFailed(false)
      setCopied(true)
    } catch {
      setCopied(false)
      setCopyFailed(true)
    }
  }

  if (!order) {
    return (
      <section className="py-(--section-y)">
        <Container size="narrow">
          <div className="flex flex-col items-center gap-5 rounded-(--radius-lg) border border-line-strong bg-white px-6 py-14 text-center">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-(--radius-pill) border border-line-strong text-ink-soft"
            >
              <Icon name="box" size={22} />
            </span>

            <div className="flex max-w-[46ch] flex-col gap-2">
              <h1 className="text-[1.35rem]">{t('orderConfirmed.nothingTitle')}</h1>
              <p className="text-ink-soft [font-size:var(--text-sm)]">
                {t('orderConfirmed.nothingDescription')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button to={paths.track} size="md" trailingIcon="arrowRight">
                {t('orderConfirmed.trackAnOrder')}
              </Button>
              <Button to={paths.shop} variant="outline" size="md">
                {t('orderConfirmed.continueShopping')}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  const paymentLabel = order.paymentMethod === 'COD' ? t('orderConfirmed.codLabel') : order.paymentMethod

  return (
    <section className="py-(--section-y)">
      <Container>
        <header className="max-w-[52rem]">
          <p className="eyebrow">{t('orderConfirmed.eyebrow')}</p>
          <h1 className="mt-4 [font-size:var(--text-display-2)]">
            {t('orderConfirmed.titleLine1')}{' '}
            <em className="font-display text-burgundy italic">{t('orderConfirmed.titleEm')}</em>
          </h1>
          <p className="mt-4 text-ink-soft [font-size:var(--text-lg)]">
            {t('orderConfirmed.placedOn', {
              orderNumber: order.orderNumber,
              date: formatDateTime(order.createdAt),
            })}
          </p>
        </header>

        {/* The tracking code is the only key to this order the shopper will ever
            have (tracking is code-only, and there is no customer order list), so
            it gets the loudest surface on the page. */}
        <div className="mt-10 flex rounded-(--radius-xl) bg-ink text-paper max-nav:flex-col max-nav:gap-6 max-nav:px-6 max-nav:py-8 nav:items-end nav:justify-between nav:gap-10 nav:px-10 nav:py-10">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="eyebrow eyebrow--inverse">{t('orderConfirmed.trackingCodeEyebrow')}</p>
            <p className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-none break-all text-paper">
              {order.trackingCode}
            </p>
            <p className="max-w-[44ch] text-paper-soft [font-size:var(--text-sm)]">
              {t('orderConfirmed.trackingCodeHint')}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button variant="light" size="md" to={paths.trackCode(order.trackingCode)} trailingIcon="arrowRight">
              {t('orderConfirmed.trackThisOrder')}
            </Button>
            {/* A plain button, not <Button variant="ghost">: that variant hardcodes
                ink in Button.css, which out-specifies any utility and would go
                invisible on this panel. */}
            <button
              type="button"
              onClick={copyTrackingCode}
              className="inline-flex items-center gap-2 rounded-(--radius-sm) border border-line-inverse-strong px-4 py-2.5 text-paper [font-size:var(--text-sm)] transition-colors duration-200 hover:bg-graphite"
            >
              {copied ? <Icon name="check" size={16} className="shrink-0" /> : null}
              {copied ? t('orderConfirmed.copied') : t('orderConfirmed.copyCode')}
            </button>
            {/* Announced for screen readers; the button label already shows it visually. */}
            <span aria-live="polite" className="sr-only">
              {copied ? t('orderConfirmed.copiedAnnounce') : ''}
            </span>
            {copyFailed ? (
              <span className="text-paper-soft [font-size:var(--text-xs)]">
                {t('orderConfirmed.copyBlocked')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-12 grid items-start max-nav:gap-12 nav:grid-cols-[minmax(0,1fr)_23rem] nav:gap-16">
          <div className="flex flex-col gap-12">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-[1.35rem]">{t('orderConfirmed.whatWeMake')}</h2>
                <Badge tone={statusTone(order.orderStatus)}>{orderStatusLabel(order.orderStatus)}</Badge>
              </div>

              <ul className="mt-6 flex flex-col">
                {items.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </ul>
            </section>

            {memoryCount > 0 ? (
              <p className="text-ink-soft [font-size:var(--text-sm)]">
                {memoryCount === 1
                  ? t('orderConfirmed.memoryCountOne')
                  : t('orderConfirmed.memoryCountOther', { count: memoryCount })}{' '}
                {t('orderConfirmed.memoryStaysReachable')}
              </p>
            ) : null}

            <section>
              <h2 className="font-display text-[1.35rem]">{t('orderConfirmed.whereGoing')}</h2>
              <dl className="m-0 mt-5 flex flex-col rounded-(--radius-lg) border border-line-strong bg-white px-5 py-1">
                <DetailRow label={t('orderConfirmed.name')} value={order.customerName} />
                <DetailRow label={t('orderConfirmed.phone')} value={order.phone} />
                <DetailRow label={t('orderConfirmed.email')} value={order.email} />
                <DetailRow label={t('orderConfirmed.city')} value={order.city} />
                <DetailRow label={t('orderConfirmed.address')} value={order.address} />
                <DetailRow label={t('orderConfirmed.deliveryNotes')} value={order.notes} />
              </dl>
              <p className="mt-4 text-ink-soft [font-size:var(--text-xs)]">
                {t('orderConfirmed.somethingWrongFootnote')}
              </p>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-(--radius-lg) border border-line-strong bg-white p-6">
              <h2 className="font-display text-[1.15rem]">{t('orderConfirmed.whatYouPay')}</h2>

              <dl className="m-0 mt-5 flex flex-col gap-2.5 [font-size:var(--text-sm)]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-soft">{t('orderConfirmed.subtotal')}</dt>
                  <dd className="m-0 text-ink">{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-soft">{t('orderConfirmed.delivery')}</dt>
                  <dd className="m-0 text-ink">
                    {Number(order.deliveryFee) === 0 ? t('common.free') : formatPrice(order.deliveryFee)}
                  </dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <dt className="font-display text-[1.05rem] text-ink">{t('orderConfirmed.total')}</dt>
                  <dd className="m-0 font-display text-[1.15rem] text-ink">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-ink-soft [font-size:var(--text-xs)]">
                {t('orderConfirmed.confirmedAmounts')}
              </p>

              <div className="mt-6 flex items-start gap-3.5 border-t border-line pt-5">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-(--radius-pill) bg-clay-tint text-clay-deep"
                >
                  <Icon name="cash" size={18} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-ink [font-size:var(--text-sm)]">{paymentLabel}</p>
                  <p className="text-ink-soft [font-size:var(--text-xs)]">
                    {t('orderConfirmed.haveReady', { total: formatPrice(order.total) })}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3.5 border-t border-line pt-5">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-(--radius-pill) bg-olive-mist text-olive-deep"
                >
                  <Icon name="truck" size={18} />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-ink [font-size:var(--text-sm)]">
                    {t('orderConfirmed.arriving', { date: formatDate(order.estimatedDelivery) })}
                  </p>
                  <p className="text-ink-soft [font-size:var(--text-xs)]">
                    {t('orderConfirmed.estimateNote')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button to={paths.trackCode(order.trackingCode)} size="lg" className="btn--block" trailingIcon="arrowRight">
                {t('orderConfirmed.followOrder')}
              </Button>
              <Button to={paths.shop} variant="outline" size="lg" className="btn--block">
                {t('orderConfirmed.continueShopping')}
              </Button>
            </div>

            <p className="text-ink-soft [font-size:var(--text-xs)]">
              {t('orderConfirmed.rememberedNote')}{' '}
              <Link className="text-burgundy underline underline-offset-4" to={paths.track}>
                {t('orderConfirmed.trackingPageLink')}
              </Link>{' '}
              {t('orderConfirmed.canFindAgain')}
            </p>
          </aside>
        </div>
      </Container>
    </section>
  )
}

export default OrderConfirmedPage
