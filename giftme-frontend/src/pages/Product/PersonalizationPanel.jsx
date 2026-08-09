import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../components/common/Button.jsx'
import Icon from '../../components/common/Icon.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { ErrorNotice } from '../../components/ui/ErrorState.jsx'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field.jsx'
import { UPLOAD_LIMITS, uploadAudio, uploadImage, uploadVideo } from '../../api/uploads.js'
import { extractErrorMessage } from '../../lib/api.js'
import { resolveMediaUrl } from '../../lib/media.js'

/**
 * The personalization form.
 *
 * Its value IS the backend's `CustomizationRequest` — same field names, same
 * limits — so what the shopper fills in here travels to `POST /api/orders`
 * untranslated, as `items[].customization`. The component is controlled: the
 * product page owns the draft and hands it to `addItem` as `customization`.
 *
 * Three fields of that record are deliberately absent: `imagePosition`,
 * `imageScale` and `imageRotation`. They describe a crop/transform that only
 * a real drag-and-zoom canvas can produce, and the backend accepts them as
 * null, so they are left unset rather than filled with plausible-looking
 * numbers the shopper never chose. `textStyle` is left unset for the same
 * reason — the UI offers a font and a colour, not a separate style token.
 */

/** Mirrors the @Size annotations on CustomizationRequest, field for field. */
const LIMITS = {
  text: 2000,
  occasion: 100,
  recipientName: 255,
  giftMessage: 2000,
}

/**
 * `font` is a free-text column on the backend — this fixed list is purely a UI
 * affordance so two shoppers asking for the same face send the same string to
 * the workshop, instead of "Script", "script" and "cursive please". `value` is
 * what travels to the backend and gets printed, so it stays a fixed English
 * face name in every language; `key` only picks the on-screen label out of the
 * `product.personalizationPanel.fonts` translation namespace.
 */
const FONTS = [
  { value: 'Fraunces', key: 'fraunces' },
  { value: 'Inter', key: 'inter' },
  { value: 'Cormorant Garamond', key: 'cormorant' },
  { value: 'Montserrat', key: 'montserrat' },
  { value: 'Dancing Script', key: 'dancing' },
]

/** Same reasoning as FONTS: `occasion` is free text (max 100) on the backend. */
const OCCASIONS = [
  { value: 'Birthday', key: 'birthday' },
  { value: 'Anniversary', key: 'anniversary' },
  { value: 'Wedding', key: 'wedding' },
  { value: 'Engagement', key: 'engagement' },
  { value: 'New baby', key: 'newBaby' },
  { value: "Mother's Day", key: 'mothersDay' },
  { value: "Father's Day", key: 'fathersDay' },
  { value: 'Graduation', key: 'graduation' },
  { value: 'Thank you', key: 'thankYou' },
  { value: 'Just because', key: 'justBecause' },
]

/**
 * `textColor` is free text too. The hex is what the workshop receives, the CSS
 * variable is what paints the swatch — both resolve to the same token, so the
 * chip on screen is the ink that gets printed.
 */
const TEXT_COLORS = [
  { key: 'ink', value: '#1E1C1A', css: 'var(--color-charcoal)' },
  { key: 'burgundy', value: '#7B3B3F', css: 'var(--color-burgundy)' },
  { key: 'clay', value: '#B4674A', css: 'var(--color-clay)' },
  { key: 'olive', value: '#6B7355', css: 'var(--color-olive)' },
  { key: 'white', value: '#FFFFFF', css: 'var(--color-white)' },
]

/** A blank draft in exactly the shape `CustomizationRequest` is deserialized from. */
export const EMPTY_CUSTOMIZATION = Object.freeze({
  imageUrl: null,
  text: '',
  font: '',
  textColor: '',
  occasion: '',
  recipientName: '',
  giftMessage: '',
  videoUrl: null,
  audioUrl: null,
  qrMemoryEnabled: false,
})

/**
 * Draft -> request body. Blank fields are dropped rather than sent as empty
 * strings, and a draft the shopper never touched becomes `null` so the order
 * item carries no customization at all (the backend only builds a
 * Customization row when the object is present).
 */
export function toCustomizationRequest(draft) {
  if (!draft) return null

  const clean = (raw) => {
    const trimmed = typeof raw === 'string' ? raw.trim() : raw
    return trimmed || undefined
  }

  const request = {
    imageUrl: clean(draft.imageUrl),
    text: clean(draft.text),
    font: clean(draft.font),
    textColor: clean(draft.textColor),
    occasion: clean(draft.occasion),
    recipientName: clean(draft.recipientName),
    giftMessage: clean(draft.giftMessage),
    videoUrl: clean(draft.videoUrl),
    audioUrl: clean(draft.audioUrl),
  }

  const hasContent = Object.values(request).some(Boolean)
  if (!hasContent && !draft.qrMemoryEnabled) return null

  return { ...request, qrMemoryEnabled: Boolean(draft.qrMemoryEnabled) }
}

function megabytes(bytes) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
}

/** Guidance on the left, a live count against the real @Size limit on the right. */
function hintWithCount(hint, current, max) {
  const used = current?.length ?? 0
  return (
    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <span>{hint}</span>
      <span className={used >= max ? 'text-clay-deep' : undefined}>
        {used} / {max}
      </span>
    </span>
  )
}

const UPLOADERS = { image: uploadImage, video: uploadVideo, audio: uploadAudio }

/**
 * One uploaded file -> one URL string on the draft.
 *
 * The size check below only fails fast so an obviously-too-large file never
 * leaves the browser. The real gate is the backend: `FileValidator` sniffs the
 * actual bytes with Apache Tika, so a renamed .exe is rejected there no matter
 * what this input's `accept` list says, and its message is what we surface.
 */
function MediaPreview({ kind, url, imageAlt }) {
  if (kind === 'image') {
    return (
      // No preflight: <figure> keeps its user-agent margin unless reset.
      <figure className="m-0 overflow-hidden rounded-(--radius-md) border border-line bg-bone">
        <img src={url} alt={imageAlt} className="max-h-64 w-full object-contain" />
      </figure>
    )
  }

  if (kind === 'video') {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full rounded-(--radius-md) border border-line bg-ink"
      />
    )
  }

  return <audio src={url} controls className="w-full" />
}

function MediaUploadField({ kind, label, hint, value, onChange, imageAlt }) {
  const { t } = useTranslation()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const limits = UPLOAD_LIMITS[kind]
  const previewUrl = resolveMediaUrl(value)

  async function handleFile(event) {
    const file = event.target.files?.[0]
    // Reset immediately so re-picking the same file after a failure still fires.
    event.target.value = ''
    if (!file) return

    setError(null)

    if (file.size > limits.maxBytes) {
      setError(t('product.personalizationPanel.fileTooLarge', {
        size: megabytes(file.size),
        limit: megabytes(limits.maxBytes),
      }))
      return
    }

    setUploading(true)
    try {
      const uploaded = await UPLOADERS[kind](file)
      onChange(uploaded.url)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    // No preflight: <fieldset> and <legend> arrive with a UA border, margin and
    // padding — all three are reset here.
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2.5 p-0 text-[0.6875rem] font-medium tracking-[0.14em] text-ink uppercase">
        {label}
      </legend>

      <div className="flex flex-col gap-2.5">
        {value ? <MediaPreview kind={kind} url={previewUrl} imageAlt={imageAlt} /> : null}

        <div className="flex flex-wrap items-center gap-3">
          {/* The panel stacks three of these, so "Choose a file" / "Remove" on
              their own are three identical, context-free names in a screen
              reader's control list — the <legend> does not name a <button>.
              Each one states which upload it belongs to. */}
          <Button
            variant="quiet"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label={t(
              value ? 'product.personalizationPanel.replaceFileFor' : 'product.personalizationPanel.chooseFileFor',
              { label: label.toLowerCase() },
            )}
          >
            {value ? t('product.personalizationPanel.replaceFile') : t('product.personalizationPanel.chooseFile')}
          </Button>

          {value ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null)
                onChange(null)
              }}
              disabled={uploading}
              aria-label={t('product.personalizationPanel.removeFor', { label: label.toLowerCase() })}
            >
              {t('product.personalizationPanel.remove')}
            </Button>
          ) : null}

          {/* MISSING API: src/api/uploads.js exposes no onUploadProgress hook, so
              this is an honest indeterminate wait rather than a fake percentage. */}
          {uploading ? (
            <span className="inline-flex items-center gap-2 text-ink-soft [font-size:var(--text-xs)]">
              <Spinner size={14} label={t('product.personalizationPanel.uploading')} />
              {t('product.personalizationPanel.uploading')}
            </span>
          ) : null}
        </div>

        <p className="text-ink-soft [font-size:var(--text-xs)]">
          {hint} {t('product.personalizationPanel.upTo', { size: megabytes(limits.maxBytes) })}
        </p>

        {error ? <ErrorNotice error={error} /> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={limits.accept}
        onChange={handleFile}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
    </fieldset>
  )
}

function PersonalizationPanel({ value, onChange, product }) {
  const { t } = useTranslation()
  const set = (key, next) => onChange({ ...value, [key]: next })

  /** Ties the QR opt-in's accessible name and description to the right spans. */
  const qrFieldId = useId()

  /**
   * The video and audio uploads live *inside* the QR Memory block and are the
   * only way to reach `videoUrl` / `audioUrl`. Unchecking the box hides them, so
   * keeping the URLs on the draft would send media the shopper can no longer see
   * or remove — and would make `toCustomizationRequest` build a customization for
   * an item that otherwise has none. Drop them with the memory they belonged to.
   */
  const setQrMemoryEnabled = (enabled) =>
    onChange(
      enabled
        ? { ...value, qrMemoryEnabled: true }
        : { ...value, qrMemoryEnabled: false, videoUrl: null, audioUrl: null },
    )

  const selectedColor = TEXT_COLORS.find((swatch) => swatch.value === value.textColor)

  // The memory page is assembled entirely from fields on this form; if all
  // three sources are blank the shopper would get a page with a generic title
  // and nothing on it, so say so before they order rather than after.
  const memoryIsEmpty =
    value.qrMemoryEnabled &&
    !value.imageUrl &&
    !value.videoUrl &&
    !value.audioUrl &&
    !value.giftMessage?.trim() &&
    !value.recipientName?.trim()

  return (
    <div className="flex flex-col gap-7">
      <MediaUploadField
        kind="image"
        label={t('product.personalizationPanel.yourPhoto')}
        hint={t('product.personalizationPanel.photoHint')}
        imageAlt={t('product.personalizationPanel.photoAlt')}
        value={value.imageUrl}
        onChange={(url) => set('imageUrl', url)}
      />

      <TextAreaField
        label={t('product.personalizationPanel.textLabel')}
        rows={3}
        maxLength={LIMITS.text}
        value={value.text}
        onChange={(event) => set('text', event.target.value)}
        placeholder={t('product.personalizationPanel.textPlaceholder')}
        hint={hintWithCount(
          t('product.personalizationPanel.textHint', { product: product?.name ?? t('common.brand') }),
          value.text,
          LIMITS.text,
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label={t('product.personalizationPanel.font')}
          value={value.font}
          onChange={(event) => set('font', event.target.value)}
          hint={t('product.personalizationPanel.fontHint')}
        >
          <option value="">{t('product.personalizationPanel.fontLetGiftMeChoose')}</option>
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {t(`product.personalizationPanel.fonts.${font.key}`)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t('product.personalizationPanel.occasion')}
          value={value.occasion}
          onChange={(event) => set('occasion', event.target.value)}
          hint={t('product.personalizationPanel.occasionHint')}
        >
          <option value="">{t('product.personalizationPanel.occasionNotSure')}</option>
          {OCCASIONS.map((occasion) => (
            <option key={occasion.value} value={occasion.value}>
              {t(`product.personalizationPanel.occasions.${occasion.key}`)}
            </option>
          ))}
        </SelectField>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[0.6875rem] font-medium tracking-[0.14em] text-ink uppercase">
          {t('product.personalizationPanel.textColor')}
        </legend>

        <ul className="flex flex-wrap gap-2.5">
          {TEXT_COLORS.map((swatch) => {
            const selected = value.textColor === swatch.value
            const swatchLabel = t(`product.personalizationPanel.colors.${swatch.key}`)
            return (
              <li key={swatch.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set('textColor', selected ? '' : swatch.value)}
                  className={[
                    'flex items-center gap-2 rounded-(--radius-pill) border py-1 pe-3.5 ps-1',
                    'transition-colors duration-200',
                    selected ? 'border-ink bg-bone' : 'border-line-strong hover:border-ink',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="size-5 rounded-(--radius-pill) border border-line-strong"
                    style={{ backgroundColor: swatch.css }}
                  />
                  <span className="[font-size:var(--text-xs)]">{swatchLabel}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-2.5 text-ink-soft [font-size:var(--text-xs)]">
          {selectedColor
            ? t('product.personalizationPanel.textColorPrinted', {
                color: t(`product.personalizationPanel.colors.${selectedColor.key}`).toLowerCase(),
              })
            : t('product.personalizationPanel.textColorOptional')}
        </p>
      </fieldset>

      <TextField
        label={t('product.personalizationPanel.recipientLabel')}
        maxLength={LIMITS.recipientName}
        value={value.recipientName}
        onChange={(event) => set('recipientName', event.target.value)}
        placeholder={t('product.personalizationPanel.recipientPlaceholder')}
        hint={hintWithCount(
          t('product.personalizationPanel.recipientHint'),
          value.recipientName,
          LIMITS.recipientName,
        )}
      />

      <TextAreaField
        label={t('product.personalizationPanel.giftMessage')}
        rows={4}
        maxLength={LIMITS.giftMessage}
        value={value.giftMessage}
        onChange={(event) => set('giftMessage', event.target.value)}
        placeholder={t('product.personalizationPanel.giftMessagePlaceholder')}
        hint={hintWithCount(
          value.qrMemoryEnabled
            ? t('product.personalizationPanel.giftMessageHintWithMemory')
            : t('product.personalizationPanel.giftMessageHint'),
          value.giftMessage,
          LIMITS.giftMessage,
        )}
      />

      {/* --- QR Memory ----------------------------------------------------
          Honest description of a real backend behaviour: with
          qrMemoryEnabled=true, OrderServiceImpl.buildCustomization creates a
          Memory row (title from recipientName, message from giftMessage,
          mainImage from imageUrl, plus videoUrl/audioUrl) and returns its
          publicCode on the order as items[].customization.memoryPublicCode. */}
      <div className="rounded-(--radius-md) border border-line-strong bg-white p-5">
        <label className="flex cursor-pointer gap-3.5">
          {/* Wrapping the whole block in the <label> would make the checkbox's
              accessible name the entire paragraph below — a screen reader would
              read all sixty words before saying "checkbox". The name is pinned
              to the short title instead, and the explanation is attached as a
              description, which is what assistive tech expects to announce
              second (and only on request). */}
          <input
            type="checkbox"
            checked={value.qrMemoryEnabled}
            onChange={(event) => setQrMemoryEnabled(event.target.checked)}
            aria-labelledby={`${qrFieldId}-title`}
            aria-describedby={`${qrFieldId}-description`}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-(--radius-xs) border border-line-input bg-white text-paper transition-colors duration-200 peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy"
          >
            {value.qrMemoryEnabled ? <Icon name="check" size={13} strokeWidth={2.2} /> : null}
          </span>

          <span className="flex flex-col gap-1.5">
            <span id={`${qrFieldId}-title`} className="flex items-center gap-2 font-medium">
              <Icon name="qr" size={17} className="text-clay-deep" />
              {t('product.personalizationPanel.addQrMemory')}
            </span>
            <span
              id={`${qrFieldId}-description`}
              className="text-ink-soft [font-size:var(--text-sm)]"
            >
              {t('product.personalizationPanel.qrMemoryDescription')}{' '}
              <span className="text-ink">/m/your-code</span>
              {t('product.personalizationPanel.qrMemoryDescriptionEnd')}
            </span>
          </span>
        </label>

        {value.qrMemoryEnabled ? (
          <div className="mt-6 flex flex-col gap-6 border-t border-line pt-6">
            <MediaUploadField
              kind="video"
              label={t('product.personalizationPanel.videoMessage')}
              hint={t('product.personalizationPanel.videoHint')}
              value={value.videoUrl}
              onChange={(url) => set('videoUrl', url)}
            />

            <MediaUploadField
              kind="audio"
              label={t('product.personalizationPanel.voiceNote')}
              hint={t('product.personalizationPanel.voiceHint')}
              value={value.audioUrl}
              onChange={(url) => set('audioUrl', url)}
            />

            {memoryIsEmpty ? (
              <p className="rounded-(--radius-sm) border border-line-strong bg-bone px-4 py-3 text-ink-soft [font-size:var(--text-sm)]">
                {t('product.personalizationPanel.memoryEmptyWarning')}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default PersonalizationPanel
