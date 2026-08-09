import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import { TextAreaField, TextField } from '../../components/ui/Field.jsx'
import ErrorState, { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner, { LoadingBlock } from '../../components/ui/Spinner.jsx'
import { useCart } from '../../store/CartContext.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createOrder } from '../../api/orders.js'
import { extractErrorCode, extractErrorMessage, isNetworkError } from '../../lib/api.js'
import { formatPrice } from '../../lib/format.js'
import { amountToFreeDelivery, estimateDeliveryFee } from '../../lib/delivery.js'
import { productImage } from '../../lib/productMedia.js'
import { rememberOrder } from '../../lib/orderHistory.js'
import { paths } from '../../app/paths.js'

/**
 * Checkout — one screen, one request: `POST /api/orders`.
 *
 * The form below is `CreateOrderRequest` and nothing else. Two backend
 * behaviours shape it:
 *
 *  1. The request carries no money. Subtotal, delivery fee and total are
 *     recomputed server-side from the current product rows, so every amount on
 *     this page is a preview — the OrderResponse carries the real ones.
 *  2. `findOrCreateCustomer` dedupes customers by phone number and updates the
 *     stored name/email on a match, so a returning shopper's details are
 *     refreshed from whatever they type here.
 */

/** Mirrors the @Size limits on CustomerInfoRequest / ShippingInfoRequest. */
const LIMITS = { name: 255, phone: 30, city: 120 }

const EMPTY_FORM = { name: '', phone: '', email: '', city: '', address: '', notes: '' }

/**
 * Mirrors what jakarta's @Email will accept, without a backtracking-prone
 * regex. Deliberately permissive — the backend is the one that decides.
 */
function looksLikeEmail(value) {
  if (/\s/.test(value)) return false
  const [local, domain, ...extra] = value.split('@')
  if (extra.length > 0 || !local || !domain) return false
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.')
}

function validate(t, form) {
  const errors = {}

  if (!form.name.trim()) errors.name = t('checkout.validation.nameRequired')
  else if (form.name.trim().length > LIMITS.name) {
    errors.name = t('checkout.validation.nameTooLong', { max: LIMITS.name })
  }

  if (!form.phone.trim()) errors.phone = t('checkout.validation.phoneRequired')
  else if (form.phone.trim().length > LIMITS.phone) {
    errors.phone = t('checkout.validation.phoneTooLong', { max: LIMITS.phone })
  }

  // @Email accepts null and empty, so an untouched field is valid; a filled one is not.
  if (form.email.trim() && !looksLikeEmail(form.email.trim())) {
    errors.email = t('checkout.validation.emailInvalid')
  }

  if (!form.city.trim()) errors.city = t('checkout.validation.cityRequired')
  else if (form.city.trim().length > LIMITS.city) {
    errors.city = t('checkout.validation.cityTooLong', { max: LIMITS.city })
  }

  if (!form.address.trim()) errors.address = t('checkout.validation.addressRequired')

  return errors
}

/** Human-readable summary of one line's Customization, for the read-only review. */
function personalizationNotes(t, customization) {
  if (!customization) return []
  const notes = []
  if (customization.occasion) notes.push(customization.occasion)
  if (customization.recipientName) {
    notes.push(t('checkout.notes.forRecipient', { name: customization.recipientName }))
  }
  if (customization.text) notes.push(`“${customization.text}”`)
  if (customization.imageUrl) notes.push(t('checkout.notes.photoAdded'))
  if (customization.videoUrl) notes.push(t('checkout.notes.videoAdded'))
  if (customization.audioUrl) notes.push(t('checkout.notes.voiceNoteAdded'))
  if (customization.qrMemoryEnabled) notes.push(t('checkout.notes.qrMemory'))
  return notes
}

/**
 * The cart context reports its hydration failure as a bare string, so a server
 * that never answered arrives here as axios's own `Network Error` sentinel — a
 * library string, not a sentence to show a shopper. <ErrorState /> writes
 * proper copy for that case, but only when handed an object carrying
 * `isNetwork`. Same treatment as CartPage's `asErrorStateInput`.
 */
function asErrorStateInput(message) {
  const isNetwork = /^network error$/i.test(message) || /^timeout of /i.test(message)
  return { message, isNetwork }
}

/**
 * Holds a line's shape while its live product is still being read.
 *
 * Without this the first paint renders every line as "no longer available":
 * the cart stores intent only, so until `GET /api/products/{id}` answers,
 * `line.product` is null for all of them. Alarming, and untrue.
 */
function ReviewLineSkeleton() {
  return (
    <li aria-hidden="true" className="flex animate-pulse gap-4">
      <div className="size-16 shrink-0 rounded-(--radius-md) bg-sand" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <div className="h-3.5 w-3/5 rounded-(--radius-xs) bg-sand" />
        <div className="h-3 w-24 rounded-(--radius-xs) bg-bone" />
      </div>
    </li>
  )
}

/**
 * One cart line, read-only. Editing happens in the cart, never here.
 *
 * `gone` is the *confirmed* verdict — the id came back 404 or inactive from
 * `GET /api/products/{id}`. A product-less line without it means the catalog
 * has not answered for this item at all, which is a different sentence: a
 * failed request must never be reported as a deleted product.
 */
function ReviewLine({ line, gone }) {
  const { t } = useTranslation()
  const notes = personalizationNotes(t, line.customization)
  const art = line.product ? productImage(line.product) : null

  let title = line.product?.name
  if (!title) title = gone ? t('checkout.itemNoLongerAvailable') : t('checkout.couldNotConfirmItem')

  return (
    <li className="flex gap-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-(--radius-md) bg-bone">
        {art ? (
          <img
            src={art.src}
            alt={art.alt}
            loading="lazy"
            className="size-full object-cover"
            style={{ objectPosition: art.position }}
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-ink [font-size:var(--text-sm)]">{title}</p>
          {line.product ? (
            <span className="shrink-0 text-ink [font-size:var(--text-sm)]">
              {formatPrice(line.lineTotal)}
            </span>
          ) : null}
        </div>

        <p className="text-ink-soft [font-size:var(--text-xs)]">
          {t('checkout.qty', { count: line.quantity })}
          {line.product ? ` · ${t('checkout.eachPrice', { price: formatPrice(line.unitPrice) })}` : ''}
        </p>

        {notes.length > 0 ? (
          <p className="text-ink-soft [font-size:var(--text-xs)]">{notes.join(' · ')}</p>
        ) : null}

        {gone ? (
          <p className="text-burgundy-deep [font-size:var(--text-xs)]">{t('checkout.removeInCart')}</p>
        ) : null}

        {line.exceedsStock ? (
          <p className="text-burgundy-deep [font-size:var(--text-xs)]">
            {t('checkout.onlyLeftLowerInCart', { stock: line.product.stock })}
          </p>
        ) : null}
      </div>
    </li>
  )
}

function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
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
    clear,
    retryHydrate,
    toOrderItems,
  } = useCart()

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // An order is created on every successful POST, so "disabled" is not enough:
  // the ref rejects a second submit synchronously, before React re-renders.
  const submitLock = useRef(false)
  // Set the instant an order exists, so the cart emptying does not flash the
  // "your cart is empty" state on the way to the confirmation page.
  const placed = useRef(false)
  const prefilled = useRef(false)

  // The session may resolve after this page mounts (/api/auth/me is revalidated
  // on boot), so prefill on arrival rather than on first render — and never
  // overwrite something already typed.
  useEffect(() => {
    if (!user || prefilled.current) return
    prefilled.current = true
    setForm((current) => ({
      ...current,
      name: current.name || user.fullName || '',
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
    }))
  }, [user])

  // `unavailableIds` holds exactly the ids `GET /api/products/{id}` answered
  // 404/inactive for — the only evidence that an item is really gone. Every
  // other product-less line is merely unread, and reading that as "gone" is
  // wrong twice: on the very first paint the cart has restored its intent but
  // has not yet run its hydrate effect (so `hydrating` is still false while
  // nothing is priced), and a failed request is not a deleted product either.
  // CartPage draws the same distinction.
  const goneIds = useMemo(() => new Set(unavailableIds.map(Number)), [unavailableIds])
  const isGone = (line) => goneIds.has(Number(line.productId))

  const hasMissingLine = lines.some(isGone)

  const deliveryFee = estimateDeliveryFee(subtotal)
  const total = subtotal + deliveryFee
  const toFreeDelivery = amountToFreeDelivery(subtotal)

  // One unread line makes every figure here a guess: `subtotal` only sums what
  // has come back, so the preview would read "0.00 MAD + delivery" — a number
  // the shopper would rightly distrust. A background refresh of an
  // already-priced cart is not this: its lines keep their products, so the
  // previous, still-plausible figures stay on screen.
  const pricesPending = lines.some((line) => !line.product && !isGone(line))

  let deliveryLabel = formatPrice(deliveryFee)
  if (pricesPending) deliveryLabel = '—'
  else if (deliveryFee === 0) deliveryLabel = t('common.free')

  let submitLabel = t('checkout.placeOrder', { total: formatPrice(total) })
  if (pricesPending) submitLabel = hydrationError ? t('checkout.placeOrderPlain') : t('checkout.checkingAvailability')

  // Anything that would make the request certain to fail, or make the preview
  // untrustworthy, blocks the button rather than being discovered as a 400.
  const blocked =
    pricesPending ||
    hydrating ||
    Boolean(hydrationError) ||
    hasMissingLine ||
    hasStockIssue ||
    availableLines.length === 0

  const catalogChanged =
    submitError?.code === 'INSUFFICIENT_STOCK' || submitError?.code === 'PRODUCT_NOT_FOUND'

  function updateField(field) {
    return (event) => {
      const { value } = event.target
      setForm((current) => ({ ...current, [field]: value }))
      setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitLock.current || blocked) return

    const errors = validate(t, form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setSubmitError(null)
      return
    }

    submitLock.current = true
    setSubmitting(true)
    setSubmitError(null)

    try {
      const order = await createOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          // Omitted rather than sent blank — the field is genuinely optional.
          email: form.email.trim() || undefined,
        },
        shipping: {
          city: form.city.trim(),
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
        },
        items: toOrderItems(),
        paymentMethod: 'COD',
      })

      placed.current = true
      rememberOrder(order)
      clear()
      // The full OrderResponse travels in router state: there is no
      // customer-facing GET /api/orders/{id} to re-read it with.
      navigate(paths.orderConfirmed, { state: { order }, replace: true })
      // submitLock stays engaged — this page is on its way out and must never
      // accept a second submit.
    } catch (err) {
      const code = extractErrorCode(err)
      setSubmitError({
        code,
        message: isNetworkError(err) ? t('checkout.networkError') : extractErrorMessage(err),
      })

      // The catalog moved under the shopper — pull the live product rows back in
      // so the review column stops showing what is no longer true.
      if (code === 'INSUFFICIENT_STOCK' || code === 'PRODUCT_NOT_FOUND') retryHydrate()

      // The cart is deliberately untouched: a failed order must lose nothing.
      submitLock.current = false
      setSubmitting(false)
    }
  }

  if (isEmpty && (placed.current || submitting)) {
    return (
      <section className="py-(--section-y)">
        <Container size="narrow">
          <LoadingBlock label={t('checkout.confirmingOrder')} />
        </Container>
      </section>
    )
  }

  if (isEmpty) {
    return (
      <section className="py-(--section-y)">
        <Container size="narrow">
          <EmptyState
            icon="bag"
            title={t('checkout.emptyTitle')}
            description={t('checkout.emptyDescription')}
            actionLabel={t('cart.browseGifts')}
            actionTo={paths.shop}
          />
          <p className="mt-5 text-center text-ink-soft [font-size:var(--text-sm)]">
            {t('checkout.alreadyAdded')}{' '}
            <Link className="text-burgundy underline underline-offset-4" to={paths.cart}>
              {t('checkout.openCart')}
            </Link>
            .
          </p>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-(--section-y)">
      <Container>
        <header className="max-w-[46rem]">
          <p className="eyebrow">{t('checkout.eyebrow')}</p>
          <h1 className="mt-4 [font-size:var(--text-display-2)]">
            {t('checkout.titleLine1')}{' '}
            <em className="font-display text-burgundy italic">{t('checkout.titleEm')}</em>
          </h1>
          <p className="mt-4 text-ink-soft [font-size:var(--text-lg)]">{t('checkout.lead')}</p>
        </header>

        {/* Below the two-column breakpoint the review sits far down the page, so
            the headline figure comes along for the ride at the top. */}
        <p className="mt-6 items-center gap-2.5 rounded-(--radius-sm) border border-line-strong bg-white px-4 py-3 text-ink-soft [font-size:var(--text-sm)] max-nav:flex nav:hidden">
          <Icon name="bag" size={16} className="shrink-0" />
          <span>
            {t('common.item', { count: itemCount })} ·{' '}
            {pricesPending ? (
              <span className="text-ink">{t('checkout.itemsSummaryChecking')}</span>
            ) : (
              <>
                <span className="text-ink">{formatPrice(total)}</span> {t('checkout.itemsSummaryEstimated')}
              </>
            )}
          </span>
        </p>

        <div className="mt-10 grid items-start max-nav:gap-12 nav:grid-cols-[minmax(0,1fr)_23rem] nav:gap-16">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
            {isAuthenticated ? (
              <p className="flex items-start gap-3 rounded-(--radius-sm) border border-line bg-olive-mist px-4 py-3 text-olive-deep [font-size:var(--text-sm)]">
                <Icon name="check" size={16} className="mt-0.5 shrink-0" />
                <span>{t('checkout.signedInAs', { name: user?.fullName || user?.email })}</span>
              </p>
            ) : (
              <p className="text-ink-soft [font-size:var(--text-sm)]">
                {t('checkout.guestCheckout')}{' '}
                <Link className="text-burgundy underline underline-offset-4" to={paths.login}>
                  {t('checkout.signInFirst')}
                </Link>{' '}
                {t('checkout.signInOnlyIf')}
              </p>
            )}

            <fieldset className="m-0 border-0 p-0">
              <legend className="p-0 text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
                {t('checkout.whoReceiving')}
              </legend>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t('checkout.fullName')}
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={LIMITS.name}
                  value={form.name}
                  onChange={updateField('name')}
                  error={fieldErrors.name}
                  placeholder={t('checkout.fullNamePlaceholder')}
                />
                <TextField
                  label={t('checkout.phone')}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={LIMITS.phone}
                  value={form.phone}
                  onChange={updateField('phone')}
                  error={fieldErrors.phone}
                  hint={t('checkout.phoneHint')}
                  placeholder={t('checkout.phonePlaceholder')}
                />
                <TextField
                  label={t('checkout.email')}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  value={form.email}
                  onChange={updateField('email')}
                  error={fieldErrors.email}
                  hint={t('checkout.emailHint')}
                  placeholder={t('checkout.emailPlaceholder')}
                  className="sm:col-span-2"
                />
              </div>
            </fieldset>

            <fieldset className="m-0 border-0 p-0">
              <legend className="p-0 text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
                {t('checkout.whereItGoes')}
              </legend>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t('checkout.city')}
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={LIMITS.city}
                  value={form.city}
                  onChange={updateField('city')}
                  error={fieldErrors.city}
                  placeholder={t('checkout.cityPlaceholder')}
                />
                <TextAreaField
                  label={t('checkout.address')}
                  name="address"
                  autoComplete="street-address"
                  required
                  rows={3}
                  value={form.address}
                  onChange={updateField('address')}
                  error={fieldErrors.address}
                  hint={t('checkout.addressHint')}
                  className="sm:col-span-2"
                />
                <TextAreaField
                  label={t('checkout.deliveryNotes')}
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={updateField('notes')}
                  hint={t('checkout.deliveryNotesHint')}
                  className="sm:col-span-2"
                />
              </div>
            </fieldset>

            <fieldset className="m-0 border-0 p-0">
              <legend className="p-0 text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
                {t('checkout.howYouPay')}
              </legend>

              {/* One method exists, so this states it rather than offering a
                  choice — there is no card form and no gateway behind GiftMe. */}
              <div className="mt-5 flex items-start gap-4 rounded-(--radius-lg) border border-line-strong bg-white px-5 py-5">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-(--radius-pill) bg-clay-tint text-clay-deep"
                >
                  <Icon name="cash" size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="font-display text-[1.05rem] text-ink">{t('checkout.codTitle')}</p>
                  <p className="text-ink-soft [font-size:var(--text-sm)]">{t('checkout.codDescription')}</p>
                </div>
              </div>
            </fieldset>

            {submitError ? (
              <div className="flex flex-col gap-3">
                <ErrorNotice error={submitError.message} />
                {catalogChanged ? (
                  <div className="flex flex-col gap-3 rounded-(--radius-sm) border border-line-strong bg-bone px-4 py-4">
                    <p className="text-ink-soft [font-size:var(--text-sm)]">
                      {t('checkout.catalogChanged')}
                    </p>
                    <div>
                      <Button variant="outline" size="sm" to={paths.cart}>
                        {t('checkout.reviewCart')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* A failed hydrate says nothing about the cart, so it must not be
                reported as one: the shopper is told what actually happened and
                given the retry here too — on a narrow screen the summary's own
                <ErrorState /> sits far below this button. */}
            {hydrationError ? (
              <div className="flex flex-col gap-3 rounded-(--radius-sm) border border-blush bg-burgundy-tint px-4 py-4">
                <p className="text-burgundy-deep [font-size:var(--text-sm)]">
                  {t('checkout.hydrationErrorNotice')}
                </p>
                <div>
                  <Button variant="outline" size="sm" onClick={retryHydrate} disabled={hydrating}>
                    {t('checkout.tryAgain')}
                  </Button>
                </div>
              </div>
            ) : blocked && !pricesPending && !hydrating ? (
              <p className="rounded-(--radius-sm) border border-blush bg-burgundy-tint px-4 py-3 text-burgundy-deep [font-size:var(--text-sm)]">
                {availableLines.length === 0 ? t('checkout.noneOrderable') : t('checkout.needsAttention')}{' '}
                <Link className="underline underline-offset-4" to={paths.cart}>
                  {t('checkout.fixInCart')}
                </Link>
                .
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                className="btn--block"
                disabled={submitting || blocked}
                aria-busy={submitting ? 'true' : undefined}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2.5">
                    <Spinner size={16} label={t('checkout.placingOrder')} />
                    {t('checkout.placingOrder')}
                  </span>
                ) : (
                  submitLabel
                )}
              </Button>
              <p className="text-center text-ink-soft [font-size:var(--text-xs)]">
                {t('checkout.confirmNote')}
              </p>
            </div>
          </form>

          <aside className="nav:sticky nav:top-[calc(var(--header-height)+1.5rem)]">
            <div className="rounded-(--radius-lg) border border-line-strong bg-white p-6">
              <h2 className="font-display text-[1.15rem]">{t('checkout.yourOrder')}</h2>

              {hydrationError ? (
                <ErrorState
                  compact
                  className="mt-5"
                  error={asErrorStateInput(hydrationError)}
                  onRetry={retryHydrate}
                  title={t('checkout.loadPricesErrorTitle')}
                />
              ) : null}

              <ul className="mt-5 flex flex-col gap-5">
                {lines.map((line) => {
                  // Nothing has answered for this line yet — a placeholder, not
                  // a verdict. Once the request has failed there is no longer
                  // anything to wait for, so the line states that instead.
                  if (!line.product && !isGone(line) && !hydrationError) {
                    return <ReviewLineSkeleton key={line.lineId} />
                  }
                  return <ReviewLine key={line.lineId} line={line} gone={isGone(line)} />
                })}
              </ul>

              <dl className="m-0 mt-6 flex flex-col gap-2.5 border-t border-line pt-5 [font-size:var(--text-sm)]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-soft">{t('checkout.subtotal')}</dt>
                  <dd className="m-0 text-ink">{pricesPending ? '—' : formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-soft">{t('checkout.deliveryEstimated')}</dt>
                  <dd className="m-0 text-ink">{deliveryLabel}</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <dt className="font-display text-[1.05rem] text-ink">{t('checkout.estimatedTotal')}</dt>
                  <dd className="m-0 font-display text-[1.15rem] text-ink">
                    {pricesPending ? '—' : formatPrice(total)}
                  </dd>
                </div>
              </dl>

              {/* No preflight: <output> keeps its UA `display: inline`. Its implicit
                  role="status" announces the refreshed figures without stealing focus. */}
              {(hydrating || pricesPending) && !hydrationError ? (
                <output className="mt-4 block text-ink-soft [font-size:var(--text-xs)]">
                  {t('checkout.confirmingPrices')}
                </output>
              ) : null}

              {toFreeDelivery > 0 && !pricesPending ? (
                <p className="mt-4 text-ink-soft [font-size:var(--text-xs)]">
                  {t('checkout.toFreeDelivery', { amount: formatPrice(toFreeDelivery) })}
                </p>
              ) : null}

              <p className="mt-4 border-t border-line pt-4 text-ink-soft [font-size:var(--text-xs)]">
                {t('checkout.estimateFootnote')}
              </p>
            </div>

            <ul className="mt-6 flex flex-col gap-3 text-ink-soft [font-size:var(--text-xs)]">
              <li className="flex items-start gap-2.5">
                <Icon name="truck" size={15} className="mt-0.5 shrink-0 text-clay" />
                {t('checkout.deliveredAcrossMorocco')}
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="lock" size={15} className="mt-0.5 shrink-0 text-clay" />
                {t('checkout.detailsPrivacy')}
              </li>
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  )
}

export default CheckoutPage
