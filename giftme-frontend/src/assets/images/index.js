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

import heroPuzzle from './hero-puzzle.svg'
import puzzlePiece from './puzzle-piece.svg'
import productPuzzle from './product-puzzle.svg'
import productMug from './product-mug.svg'
import productQrMemory from './product-qr-memory.svg'
import memoryCover from './memory-cover.svg'
import qrCode from './qr-code.svg'
import moment1 from './moment-1.svg'
import moment2 from './moment-2.svg'
import moment3 from './moment-3.svg'

export const images = {
  heroPuzzle,
  puzzlePiece,
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
