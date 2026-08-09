import { useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../../components/common/Container.jsx'
import SectionHeading from '../../components/common/SectionHeading.jsx'
import Reveal from '../../components/common/Reveal.jsx'
import ProductCard, { ProductCardSkeleton } from '../../components/ui/ProductCard.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import ShopToolbar, { DEFAULT_SORT, SORT_OPTIONS } from './ShopToolbar.jsx'
import { listCategories, listProducts, PAGE_SIZE } from '../../api/products.js'
import { useAsync } from '../../hooks/useAsync.js'
import { paths } from '../../app/paths.js'

/**
 * The shop.
 *
 * Two rules shape this whole file.
 *
 * The first is that the backend does the work. `GET /api/products` filters by
 * category, searches name/description/shortDescription, sorts and paginates
 * (ProductService.list + ProductSpecifications), so nothing here ever touches a
 * fetched page — no client-side filtering, no re-sorting, no slicing. What the
 * grid renders is exactly the page the server returned.
 *
 * The second is that the URL is the state. Category, search, sort and page live
 * in the query string and are read back out of it on every render, so a
 * filtered view is a link someone can send, the back button walks the filters
 * a shopper actually chose, and there is no second copy of the state to drift.
 * `paths.category(name)` from the home page lands here already filtered.
 */

/**
 * Four columns of gifts at desktop, two on a phone.
 *
 * Every breakpoint pair below is range-disjoint (`max-sm` / `sm:max-nav` /
 * `nav`) rather than "base plus override". This app builds Tailwind from two
 * entry points and a `nav:` utility loses to a base utility setting the same
 * property, so an overlapping pair would quietly render the wrong column count.
 */
const GRID_CLASS = [
  'grid gap-y-10',
  'max-sm:grid-cols-2 max-sm:gap-x-4',
  'sm:max-nav:grid-cols-3 sm:max-nav:gap-x-6',
  'nav:grid-cols-4 nav:gap-x-7',
].join(' ')

function ShopPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const resultsRef = useRef(null)

  // Bumped by "Clear filters" so the toolbar can drop a search the shopper
  // typed but never committed. See `clearFilters` for why the URL alone cannot
  // carry that message.
  const [clearCount, setClearCount] = useState(0)

  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''
  const sort = readSort(searchParams.get('sort'))
  const page = readPage(searchParams.get('page'))
  const hasFilters = Boolean(category || search)

  const {
    data: pageData,
    error,
    loading,
    run,
  } = useAsync(() => listProducts({ category, search, page, sort }), [category, search, page, sort])

  const categories = useAsync(() => listCategories(), [])

  /**
   * The one writer of the query string. An empty value drops its parameter
   * entirely, so a default view is `/shop` rather than
   * `/shop?category=&search=&sort=createdAt,desc&page=0`.
   */
  const updateParams = useCallback(
    (patch, { replace = false } = {}) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === undefined || value === '') next.delete(key)
            else next.set(key, String(value))
          }
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  /**
   * A new search is a new result set, so page 0 — otherwise a shopper on page 3
   * of "mugs" searches for "frame" and lands on an empty page 3 of frames.
   *
   * `replace` because this fires off a debounce: pushing an entry per typed
   * word would bury the previous page under a dozen half-typed words.
   */
  const handleSearchChange = useCallback(
    (value) => updateParams({ search: value, page: null }, { replace: true }),
    [updateParams],
  )

  const handleSortChange = useCallback(
    (value) => updateParams({ sort: value === DEFAULT_SORT ? null : value, page: null }),
    [updateParams],
  )

  /** The chips are links, so they need a destination rather than a handler. */
  const categoryTo = useCallback(
    (name) => {
      const next = new URLSearchParams(searchParams)
      if (name) next.set('category', name)
      else next.delete('category')
      next.delete('page')

      const query = next.toString()
      return query ? `${paths.shop}?${query}` : paths.shop
    },
    [searchParams],
  )

  const handlePageChange = useCallback(
    (nextPage) => {
      updateParams({ page: nextPage <= 0 ? null : nextPage })
      // The grid is about to swap under the shopper; put them back at its top
      // rather than halfway down a list they have never seen.
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [updateParams],
  )

  /**
   * The URL cannot carry this on its own. When only a category is active the
   * `search` parameter is already absent, so clearing writes the same empty
   * value it had before and the toolbar — which syncs off that value — never
   * hears about it. A search typed into the box a moment earlier would then sit
   * out its debounce and re-apply itself, one keystroke after the shopper asked
   * for everything to go away. The counter is the missing signal.
   */
  const clearFilters = useCallback(() => {
    updateParams({ category: null, search: null, page: null })
    setClearCount((count) => count + 1)
  }, [updateParams])

  /**
   * When the backend is down both requests fail, and a shopper should not have
   * to press two different retries to bring one page back. The grid's retry
   * therefore also re-runs the categories — but only when they are the ones
   * that failed, so a working filter row is never refetched for nothing.
   */
  const categoriesRun = categories.run
  const categoriesFailed = Boolean(categories.error)
  const retryAll = useCallback(() => {
    run()
    if (categoriesFailed) categoriesRun()
  }, [run, categoriesFailed, categoriesRun])

  const products = pageData?.content ?? []
  const total = pageData?.totalElements ?? 0
  const hasResults = products.length > 0

  let status
  let results

  if (error) {
    status = t('shop.resultsUnavailable')
    results = <ErrorState error={error} onRetry={retryAll} />
  } else if (loading) {
    status = t('shop.finding')
    results = <ProductGrid loading />
  } else {
    status = resultSummary(t, total, category, search)
    results = hasResults ? (
      <ProductGrid products={products} />
    ) : (
      <ShopEmptyState
        hasFilters={hasFilters}
        // Content can be empty while the result set is not: `?page=9` asks for
        // a page past the end of a real, matching set. `totalElements` is
        // counted after the filters are applied, so a non-zero total here is
        // proof the filters matched and only the page index is wrong.
        pastLastPage={total > 0}
        onClearFilters={clearFilters}
        onBackToStart={() => handlePageChange(0)}
        onRetry={run}
      />
    )
  }

  return (
    <>
      <section aria-labelledby="shop-title" className="border-b border-line bg-bone">
        <Container>
          <div className="py-(--section-y)">
            <SectionHeading
              as="h1"
              id="shop-title"
              eyebrow={t('shop.eyebrow')}
              title={
                <>
                  {t('shop.titleLine1')} <em>{t('shop.titleEm')}</em>
                </>
              }
              description={t('shop.description')}
            />
          </div>
        </Container>
      </section>

      <section className="py-(--section-y)">
        <Container>
          <ShopToolbar
            search={search}
            onSearchChange={handleSearchChange}
            sort={sort}
            onSortChange={handleSortChange}
            categories={categories.data}
            categoriesLoading={categories.loading}
            categoriesError={categories.error}
            onRetryCategories={categories.run}
            activeCategory={category}
            categoryTo={categoryTo}
            clearCount={clearCount}
          />

          <div
            ref={resultsRef}
            // globals.css already sets `scroll-padding-top` for the sticky
            // header, so scrolling to this element clears it.
            className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-6"
          >
            <p aria-live="polite" className="text-ink-soft [font-size:var(--text-sm)]">
              {status}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-burgundy underline underline-offset-4 transition-colors duration-200 hover:text-burgundy-deep [font-size:var(--text-sm)]"
              >
                {t('shop.clearFilters')}
              </button>
            ) : null}
          </div>

          <div className="mt-8">{results}</div>

          {!error && !loading && hasResults ? (
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              first={pageData.first}
              last={pageData.last}
              onChange={handlePageChange}
              className="mt-14"
            />
          ) : null}
        </Container>
      </section>
    </>
  )
}

/**
 * The grid, in both of its states.
 *
 * The skeletons are the same count (`PAGE_SIZE`) in the same grid as the real
 * cards, so a filter change resizes nothing — the page holds its shape and the
 * photographs arrive into it.
 */
export function ProductGrid({ products = [], loading = false }) {
  if (loading) {
    return (
      <ul aria-busy="true" className={GRID_CLASS}>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={GRID_CLASS}>
      {products.map((product, index) => (
        // The stagger is capped at one row: past that it is a delay, not a
        // reveal, and the fourth row would arrive noticeably late.
        <Reveal as="li" key={product.id} delay={Math.min(index, 3) * 80}>
          <ProductCard product={product} priority={index < 4} />
        </Reveal>
      ))}
    </ul>
  )
}

/**
 * Three different nothings, and they are not interchangeable: a page past the
 * end is ours to undo, a filter that matched nothing is the shopper's to undo,
 * and an empty catalog is neither — it is just the truth, so it says so instead
 * of implying the shopper did something wrong.
 *
 * The page check comes first, and it has to: `pastLastPage` means the backend
 * counted matches for these exact filters, so telling a shopper on
 * `?search=mug&page=5` that nothing matches would contradict the "6 gifts"
 * printed directly above it — and "Clear filters" would throw away a search
 * that was working. Only the page index is wrong, so only the page is offered.
 */
function ShopEmptyState({ hasFilters, pastLastPage, onClearFilters, onBackToStart, onRetry }) {
  const { t } = useTranslation()

  if (pastLastPage) {
    return (
      <EmptyState
        icon="box"
        title={t('shop.emptyPageTitle')}
        description={hasFilters ? t('shop.emptyPageWithFilters') : t('shop.emptyPageNoFilters')}
        actionLabel={t('shop.backToFirstPage')}
        onAction={onBackToStart}
      />
    )
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon="search"
        title={t('shop.noMatchTitle')}
        description={t('shop.noMatchDescription')}
        actionLabel={t('shop.clearFilters')}
        onAction={onClearFilters}
      />
    )
  }

  return (
    <EmptyState
      icon="gift"
      title={t('shop.restockingTitle')}
      description={t('shop.restockingDescription')}
      actionLabel={t('shop.refresh')}
      onAction={onRetry}
    />
  )
}

/** "12 gifts in Mugs", "1 gift for “frame”" — the count with its context. */
function resultSummary(t, total, category, search) {
  const parts = [t('shop.resultCount', { count: total })]
  if (category) parts.push(t('shop.inCategory', { category }))
  if (search) parts.push(t('shop.forSearch', { search }))
  return parts.join(' ')
}

/**
 * An unknown sort property is a 500 from Spring (PropertyReferenceException),
 * not a validation error, so a hand-edited URL falls back to the default rather
 * than reaching the backend.
 */
function readSort(value) {
  return SORT_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_SORT
}

/** Spring pages are zero-based; anything not a non-negative integer is page 0. */
function readPage(value) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export default ShopPage
