# Images

Four **real photographs** carry the storefront (`customer-gift.jpg`,
`product-*.jpg`); everything else is a **hand-drawn SVG placeholder** built from
the GiftMe palette. Nothing is loaded from a remote URL — the whole site ships
self-contained.

## ⚠ Before launch

- **`product-mug.jpg` is a crop, not the original.** The uncropped frame
  (`product-mug-uncropped.jpg`, kept here unreferenced) has **another company's
  printed business card** lying in the gift box, legible in any portrait crop.
  The shipped file cuts it out (`sips -c 820 750 --cropOffset 0 235`). If you
  ever swap back to the original, that branding returns.
- **None of these four photographs were shot for GiftMe.** Replace them with
  the brand's own photography before the storefront goes live. The two things
  to match when you do: portrait framing (the grid and the hero filmstrip both
  crop to 4:5), and warm neutral light — the page is ivory, sand and ink, and a
  cool blue-white product shot will look pasted in.
- `qr-code.svg` is a **decorative QR-shaped graphic**, not a scannable code. It
  renders with an empty `alt`. Replace it with a real generated QR before any
  flow actually asks a user to scan it.

## How to replace a placeholder with a real photo

1. Drop the real file in this folder using the same semantic name, e.g.
   `memory-cover.jpg` next to (or instead of) `memory-cover.svg`.
2. Update the matching import in [`index.js`](./index.js). That is the only
   file that references image paths.
3. Nothing else changes — components and `src/data/*` read from the `images`
   map, never from a path.

Where a component needs a different crop of the same photograph it sets
`object-position` at the call site (`src/data/categories.js` keeps one per
category). The same four photographs appear in several sections on purpose,
always at a different aspect and framing, so the page never reads as the same
three shots repeated.

## What each image is for

| Key               | File                    | Used by                                            |
| ----------------- | ----------------------- | -------------------------------------------------- |
| `customerGift`    | `customer-gift.jpg`     | Shop grid (gift sets), QR memory scene, showcase    |
| `productPuzzle`   | `product-puzzle.jpg`    | Hero filmstrip, shop grid, personalization, details |
| `productMug`      | `product-mug.jpg`       | Hero filmstrip, shop grid, personalization          |
| `productQrMemory` | `product-qr-memory.jpg` | Hero filmstrip, shop grid, showcase detail          |
| `memoryCover`     | `memory-cover.svg`      | Phone memory preview cover                          |
| `moment1..3`      | `moment-*.svg`          | Memory gallery thumbnails                           |
| `qrCode`          | `qr-code.svg`           | QR tag chips in the hero and the QR memory section  |

The SVG placeholders were recoloured on 2026-08-08 out of the old pink palette
into the brand's warm neutrals (sand, clay, olive, graphite), so a page that is
otherwise ivory and ink no longer has a pink illustration inside its phone
preview.

## Kept on disk, unreferenced

`hero-puzzle.svg`, `puzzle-piece.svg`, `product-*.svg` and
`product-mug-uncropped.jpg` are no longer imported. They are left here as
fallbacks and as the record of what the shipped crops came from; nothing in the
bundle grows because of them.

## The logo

`brand-logo.webp` is the shipped logo and the only one `BrandLogo.jsx` imports.
It is a **lossless** WebP re-encode of the PNG master: identical pixels on the
same 1536×1024 transparent canvas, so the `ART` window measured in
`src/components/common/BrandLogo.jsx` still describes it exactly. 131 KB against
the PNG's 2.3 MB. Re-encode rather than re-crop if the master ever changes —
cropping the file would invalidate that `ART` window.

## Master artwork (on disk, not in the repo)

Three PNG originals live in this folder but are **git-ignored**, so they never
enter a commit or the bundle. They are design sources, not assets; at 2+ MB each
they made an ordinary push time out on a slow uplink.

- `4EB6D51C….png` — the logo master the WebP above is encoded from, and the
  source of truth for the logo's design. `brand-logo-master.png` is a
  byte-identical copy of it.
- `3262C5D0….png` — a flat-lay of the gift box, puzzle pieces and QR card. It
  was tried as a blurred atmosphere layer behind the hero and then dropped: the
  hero is typographic by design, and even blurred past recognition, a photo of
  product objects worked against that. No derivative of it ships.

Keep them backed up outside the repo. Anyone cloning fresh will not get them,
and only needs them to re-cut the logo.
