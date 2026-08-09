/**
 * Single import point for every product / editorial image.
 *
 * Components and data files never reference a file path directly — they read
 * from this map. Swapping a placeholder for real photography is therefore a
 * one-line change here (drop `puzzle-hero.jpg` in this folder, update the
 * import) with no changes anywhere else in the app.
 *
 * See ./README.md for the replacement checklist.
 */

/* The logo master, used directly by BrandLogo.jsx. The artwork is a 992×307
   lockup sitting inside a 1536×1024 transparent canvas; the surrounding empty
   space is cropped in CSS, not in the file — see BrandLogo.jsx.

   Lossless WebP re-encode of the UUID-named PNG original: same pixels, same
   1536×1024 canvas (so BrandLogo's ART constants still hold), 131 KB instead
   of 2.3 MB. The PNG original stays out of the repo — see ./README.md. */
import brandLogo from './brand-logo.webp'
import customerGift from './customer-gift.jpg'
import productPuzzle from './product-puzzle.jpg'
import productMug from './product-mug.jpg'
import productQrMemory from './product-qr-memory.jpg'
import memoryCover from './memory-cover.svg'
import qrCode from './qr-code.svg'
import moment1 from './moment-1.svg'
import moment2 from './moment-2.svg'
import moment3 from './moment-3.svg'

export const images = {
  brandLogo,
  customerGift,
  productPuzzle,
  productMug,
  productQrMemory,
  memoryCover,
  qrCode,
  moment1,
  moment2,
  moment3,
}

export const memoryGallery = [moment1, moment2, moment3]
