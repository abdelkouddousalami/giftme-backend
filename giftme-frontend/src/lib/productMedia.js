import { images } from '../assets/images'
import { resolveMediaUrl } from './media.js'

/**
 * Artwork for a backend product.
 *
 * `products.main_image` is nullable in the schema and is `NULL` for all three
 * seeded products, so a catalog freshly migrated from `V2__seed_data.sql`
 * carries no imagery at all. Rather than render a grid of grey boxes, an
 * unset image falls back to the brand photography already in this repo, matched
 * on the product's *real* slug.
 *
 * This is a presentation fallback for a null field, not product data: the name,
 * price, description, stock and category always come from the API, and the
 * moment an admin uploads a real image through `/api/admin/products` it wins.
 */

const FALLBACK_BY_SLUG = {
  'personalized-puzzle': {
    src: images.productPuzzle,
    alt: 'A personalized photo puzzle of a couple, assembled on a wooden table beside the original photo it was printed from',
    position: '50% 46%',
  },
  'personalized-mug': {
    src: images.productMug,
    alt: 'A white ceramic mug printed with a custom portrait and name, in an open gift box beside a matching personalized bottle',
    position: '50% 52%',
  },
  'qr-memory-experience': {
    src: images.productQrMemory,
    alt: 'Hands holding a kraft gift tag printed with a QR code, beside the phone showing the private memory page it opens',
    position: '46% 50%',
  },
}

const GENERIC_FALLBACK = {
  src: images.customerGift,
  alt: 'A personalized photo puzzle and a matching mug, both printed with the same illustrated portrait',
  position: '42% 45%',
}

/**
 * @param {object} product a backend ProductResponse
 * @returns {{src: string, alt: string, position: string, isFallback: boolean}}
 */
export function productImage(product) {
  const uploaded = resolveMediaUrl(product?.mainImage)
  if (uploaded) {
    return {
      src: uploaded,
      alt: product.name,
      position: '50% 50%',
      isFallback: false,
    }
  }

  const fallback = FALLBACK_BY_SLUG[product?.slug] ?? GENERIC_FALLBACK
  return { ...fallback, isFallback: true }
}

/**
 * Every image for the product page's gallery: the main image first, then
 * `galleryImages` (a real backend field, populated via the admin product form).
 */
export function productGallery(product) {
  const main = productImage(product)
  const gallery = (product?.galleryImages ?? [])
    .map((path) => resolveMediaUrl(path))
    .filter(Boolean)
    .map((src, index) => ({
      src,
      alt: `${product.name} — view ${index + 2}`,
      position: '50% 50%',
      isFallback: false,
    }))

  return [main, ...gallery]
}
