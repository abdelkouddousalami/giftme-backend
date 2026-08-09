import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../../components/common/Icon.jsx'
import { Field, SelectField } from '../../components/ui/Field.jsx'

/**
 * The shop's controls: category chips, a search box and a sort select.
 *
 * Nothing here holds catalog state. Every control reports upward and the shop
 * page writes the change into the URL, which is the single source of truth for
 * what is on screen — that is what makes a filtered view shareable and the back
 * button meaningful. The one piece of local state is the search draft, because
 * a keystroke must not become a history entry.
 *
 * The category chips are <Link>s rather than buttons on purpose: a filter is a
 * destination here, so it should be openable in a new tab and readable in the
 * status bar before it is clicked. The shop page hands down the `to` builder so
 * the rest of the query string (search, sort) survives the jump.
 */

/**
 * The sort menu, whitelisted.
 *
 * Each value is a Spring `sort` expression naming a real property on the
 * Product entity (`createdAt` and the rest of BaseEntity, `price`, `name`).
 * Spring throws PropertyReferenceException — a 500, not a validation error — on
 * an unknown property, so the shop page validates the URL parameter against
 * this list before it ever reaches the backend.
 */
// No `label` here - ShopPage only reads `value` off this list (to whitelist a
// hand-edited URL's ?sort= before it reaches the backend), and ShopToolbar
// looks the label up by value from the `shop.*` translation namespace instead,
// via SORT_LABEL_KEYS below.
export const SORT_OPTIONS = [
  { value: 'createdAt,desc' },
  { value: 'price,asc' },
  { value: 'price,desc' },
  { value: 'name,asc' },
]

const SORT_LABEL_KEYS = {
  'createdAt,desc': 'shop.sortNewest',
  'price,asc': 'shop.sortPriceAsc',
  'price,desc': 'shop.sortPriceDesc',
  'name,asc': 'shop.sortNameAsc',
}

export const DEFAULT_SORT = 'createdAt,desc'

/** Long enough that a typed word is one request, short enough to feel live. */
const SEARCH_DEBOUNCE_MS = 350

const SEARCH_INPUT_CLASS = [
  // No preflight: the input carries its UA border and appearance unless both
  // are stated here (Field.jsx's own controls do the same).
  'w-full appearance-none rounded-(--radius-sm) border border-line-input bg-white',
  'py-2.5 pe-11 ps-10 text-ink [font-size:var(--text-base)]',
  'transition-colors duration-200 placeholder:text-ink-soft',
  'focus:border-burgundy focus:outline-none',
  // We draw our own clear button; hide WebKit's duplicate.
  '[&::-webkit-search-cancel-button]:appearance-none',
].join(' ')

const CHIP_BASE_CLASS =
  'inline-flex items-center gap-2 rounded-(--radius-pill) border px-4 py-2 [font-size:var(--text-xs)] transition-colors duration-200'

function ShopToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  activeCategory,
  categoryTo,
  clearCount,
}) {
  const { t } = useTranslation()
  const searchInputId = useId()
  const [draft, setDraft] = useState(search)

  // The last value handed to the parent. Comparing against it (rather than
  // against the `search` prop) is what keeps the two directions apart: an echo
  // of our own commit must not reset the field, while a genuine outside change
  // — back button, "clear filters" — must.
  const committed = useRef(search)
  const timer = useRef(null)

  const commit = useCallback(
    (value) => {
      committed.current = value
      onSearchChange(value)
    },
    [onSearchChange],
  )

  useEffect(() => {
    if (search === committed.current) return
    committed.current = search
    setDraft(search)
  }, [search])

  useEffect(() => {
    if (draft === committed.current) return undefined

    timer.current = setTimeout(() => commit(draft), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer.current)
  }, [draft, commit])

  /**
   * "Clear filters" pressed upstream. The effect above syncs off the `search`
   * prop, which does not move when the search was only ever a draft — so
   * without this the pending debounce would survive the clear and re-apply the
   * very term the shopper just dismissed. Skipped on mount (`clearCount` is 0).
   */
  useEffect(() => {
    if (!clearCount) return
    clearTimeout(timer.current)
    committed.current = ''
    setDraft('')
  }, [clearCount])

  /** Enter skips the wait — the shopper has already told us they are done. */
  const handleSubmit = (event) => {
    event.preventDefault()
    clearTimeout(timer.current)
    if (draft !== committed.current) commit(draft)
  }

  const handleClear = () => {
    clearTimeout(timer.current)
    setDraft('')
    if (committed.current !== '') commit('')
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter
        categories={categories}
        loading={categoriesLoading}
        error={categoriesError}
        onRetry={onRetryCategories}
        activeCategory={activeCategory}
        categoryTo={categoryTo}
        // A chip keeps the active search when it is clicked, but its count is
        // the size of that category across the whole catalog. With a search
        // running the two disagree — "Frames 5" lands on "0 gifts in Frames for
        // 'mug'" — so the number is withheld rather than shown as a promise the
        // link cannot keep.
        showCounts={!search}
      />

      <div className="flex border-t border-line pt-6 max-sm:flex-col max-sm:gap-5 sm:flex-row sm:items-end sm:gap-4">
        <form role="search" onSubmit={handleSubmit} className="sm:flex-1">
          <Field label={t('shop.searchLabel')} htmlFor={searchInputId}>
            <div className="relative">
              <Icon
                name="search"
                size={17}
                className="pointer-events-none absolute top-1/2 start-3.5 -translate-y-1/2 text-ink-soft"
              />

              <input
                id={searchInputId}
                type="search"
                name="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                autoComplete="off"
                className={SEARCH_INPUT_CLASS}
              />

              {draft ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label={t('shop.clearSearch')}
                  className="absolute top-1/2 end-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-(--radius-pill) text-ink-soft transition-colors duration-200 hover:bg-bone hover:text-ink"
                >
                  <Icon name="close" size={15} />
                </button>
              ) : null}
            </div>
          </Field>

          {/* Submitting is a shortcut, not a requirement — results already
              update while typing, so the button is for keyboard and screen
              reader users who expect a form to have one. */}
          <button type="submit" className="sr-only">
            {t('shop.search')}
          </button>
        </form>

        <SelectField
          label={t('shop.sortBy')}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="max-sm:w-full sm:w-60"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(SORT_LABEL_KEYS[option.value])}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  )
}

/**
 * The category row.
 *
 * Categories are derived from the catalog itself (see the MISSING API note in
 * api/products.js — there is no categories endpoint), so this list can fail or
 * come back empty independently of the grid. Neither case is allowed to take
 * the products down with it: a failure shows a quiet retry, an empty result
 * shows nothing at all, and the grid keeps working in both.
 */
function CategoryFilter({
  categories,
  loading,
  error,
  onRetry,
  activeCategory,
  categoryTo,
  showCounts,
}) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <ul aria-hidden="true" className="flex animate-pulse flex-wrap gap-2.5">
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="h-9 w-28 rounded-(--radius-pill) bg-sand" />
        ))}
      </ul>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-(--radius-sm) border border-blush bg-burgundy-tint px-4 py-3"
      >
        <p className="text-burgundy-deep [font-size:var(--text-sm)]">
          {error.isNetwork
            ? t('shop.categoriesErrorNetwork')
            : t('shop.categoriesError', { message: error.message })}
        </p>
        {/* Deliberately not "Try again": the grid below has a retry of its own
            when it fails too, and two identical buttons on one screen is a
            guessing game for anyone navigating by control names. */}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-burgundy-deep underline underline-offset-4 [font-size:var(--text-sm)]"
        >
          {t('shop.reloadFilters')}
        </button>
      </div>
    )
  }

  if (!categories?.length) return null

  return (
    <nav aria-label={t('shop.filterByCategory')}>
      <ul className="flex flex-wrap gap-2.5">
        <li>
          <Chip to={categoryTo(null)} active={!activeCategory}>
            {t('shop.allGifts')}
          </Chip>
        </li>

        {categories.map((category) => (
          <li key={category.name}>
            <Chip
              to={categoryTo(category.name)}
              // The backend matches `category` case-insensitively, so the
              // chip's selected state has to as well.
              active={activeCategory?.toLowerCase() === category.name.toLowerCase()}
              count={showCounts ? category.count : undefined}
            >
              {category.name}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * One filter chip. `count` is optional and deliberately absent from "All
 * gifts": that number would come from summing the categorised products, which
 * would silently under-report a catalog holding any product without a category.
 */
function Chip({ to, active, count, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'true' : undefined}
      className={[
        CHIP_BASE_CLASS,
        active ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink hover:border-ink',
      ].join(' ')}
    >
      {children}
      {typeof count === 'number' ? (
        <span className={active ? 'text-paper-soft' : 'text-ink-soft'}>{count}</span>
      ) : null}
    </Link>
  )
}

export default ShopToolbar
