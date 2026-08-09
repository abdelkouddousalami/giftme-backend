import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import ProductCard, { ProductCardSkeleton } from '../ui/ProductCard.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { listProducts } from '../../api/products.js'
import { useAsync } from '../../hooks/useAsync.js'
import { paths, sectionIds } from '../../app/paths.js'

/**
 * The shop, one screen below the fold.
 *
 * This is the section that decides whether GiftMe reads as a store or as a
 * landing page, so it is a real grid of real merchandise — and since the
 * rewrite, *literally* real: every card is a `ProductResponse` from
 * `GET /api/products`, not a hardcoded array. It previously rendered four
 * invented "categories" whose prices had drifted 30–50% away from the catalog
 * the backend actually sells (199 vs 149, 129 vs 99, 279 vs 179), which is the
 * precise failure mode a hardcoded storefront produces.
 *
 * Four is a composition constraint, not a business rule: it fills the row at
 * `nav` without wrapping. The full catalog is one click away.
 *
 * Two columns on a phone rather than a stack: four full-width cards would be
 * four screens of scrolling before a shopper had seen the range, which is the
 * opposite of what a discovery section is for.
 */

const FEATURED_COUNT = 4

function ShopByGift() {
  const { data, error, loading, run } = useAsync(
    () => listProducts({ size: FEATURED_COUNT, sort: 'createdAt,desc' }),
    [],
  )

  const products = data?.content ?? []

  const GRID_CLASS =
    'grid gap-y-10 max-nav:grid-cols-2 max-sm:gap-x-4 sm:max-wide:gap-x-6 nav:grid-cols-4 wide:gap-x-7'

  /** Loading / error / empty / success, as early returns rather than a ternary chain. */
  function renderGrid() {
    if (loading) {
      return (
        <ul className={GRID_CLASS}>
          {Array.from({ length: FEATURED_COUNT }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      )
    }

    if (error) {
      return <ErrorState error={error} onRetry={run} title="We couldn't load the catalog" />
    }

    if (products.length === 0) {
      return (
        <EmptyState
          icon="gift"
          title="Nothing in the shop just yet"
          description="New gifts are on their way. Check back shortly."
        />
      )
    }

    return (
      <ul className={GRID_CLASS}>
        {products.map((product, index) => (
          <Reveal as="li" key={product.id} delay={index * 80}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </ul>
    )
  }

  return (
    <section
      id={sectionIds.gifts}
      aria-labelledby="gifts-title"
      className="py-(--section-y)"
    >
      <Container>
        <Reveal className="flex max-wide:flex-col max-wide:gap-7 wide:flex-row wide:items-end wide:justify-between wide:gap-16">
          <SectionHeading
            id="gifts-title"
            eyebrow="The shop"
            title={
              <>
                Find something <em>worth remembering.</em>
              </>
            }
            description="Each one printed with your photo, packed by hand, and ready to carry a private memory behind its tag."
          />

          <Link
            to={paths.shop}
            className="group inline-flex shrink-0 items-center gap-2 text-[0.875rem] font-medium text-ink transition-colors duration-200 hover:text-burgundy max-wide:self-start wide:mb-2 wide:self-auto"
          >
            <span className="relative">
              <span>View all gifts</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 block h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-brand group-hover:scale-x-100"
              />
            </span>
            <Icon
              name="arrowRight"
              size={16}
              className="transition-transform duration-200 ease-brand group-hover:translate-x-1"
            />
          </Link>
        </Reveal>

        <div className="max-wide:mt-12 wide:mt-16">{renderGrid()}</div>
      </Container>
    </section>
  )
}

export default ShopByGift
