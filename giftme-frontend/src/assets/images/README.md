# Images

All artwork in this folder is a **hand-drawn SVG placeholder** built from the
GiftMe palette. Nothing here is stock photography and nothing is loaded from a
remote URL — the whole site ships self-contained.

## How to replace a placeholder with a real photo

1. Drop the real file in this folder using the same semantic name, e.g.
   `puzzle-hero.jpg` next to (or instead of) `hero-puzzle.svg`.
2. Update the matching import in [`index.js`](./index.js). That is the only
   file that references image paths.
3. Nothing else changes — components and `src/data/*` read from the `images`
   map, never from a path.

## What each image is for

| Key                | File                    | Used by                              | Suggested real asset                 |
| ------------------ | ----------------------- | ------------------------------------ | ------------------------------------ |
| `heroPuzzle`       | `hero-puzzle.svg`       | Hero visual                          | Portrait 4:5 photo of a framed puzzle |
| `puzzlePiece`      | `puzzle-piece.svg`      | Floating detail in hero + QR section | Cut-out of a single puzzle piece      |
| `productPuzzle`    | `product-puzzle.svg`    | Featured gifts card 1                | Packshot 4:5                          |
| `productMug`       | `product-mug.svg`       | Featured gifts card 2                | Packshot 4:5                          |
| `productQrMemory`  | `product-qr-memory.svg` | Featured gifts card 3                | Packshot 4:5                          |
| `memoryCover`      | `memory-cover.svg`      | Phone memory preview cover           | Portrait photo, 3:4 or taller         |
| `qrCode`           | `qr-code.svg`           | QR tag in hero + QR section          | A real generated QR (see note)        |
| `moment1..3`       | `moment-*.svg`          | Memory gallery thumbnails            | Square crops                          |

## Notes

- `qr-code.svg` is a **decorative QR-shaped graphic**, not a scannable code. It
  is rendered as a decorative image (empty `alt`). Replace it with a real
  generated QR before any flow actually asks a user to scan it.
- Placeholders are intentionally sized at their real aspect ratio so swapping in
  photography will not shift the layout.
