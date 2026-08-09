import { paths, homeAnchor, sectionIds } from '../app/paths'

/**
 * The four things a shopper needs from a gift storefront: what you sell, what
 * makes it yours, how it reaches them, and who you are.
 *
 * Three of the four resolve to real sections on the home page today. "Our
 * Story" points at `/about`, which is declared in paths.js but not yet routed —
 * see the note at the top of that file.
 *
 * No `label` here on purpose: Header.jsx looks one up by `id` from the `nav.*`
 * translation namespace, so this file doesn't need to change per language.
 */
export const primaryNav = [
  { id: 'shop', to: homeAnchor(sectionIds.gifts) },
  { id: 'personalized', to: homeAnchor(sectionIds.personalize) },
  { id: 'how-it-works', to: homeAnchor(sectionIds.howItWorks) },
  { id: 'story', to: paths.about },
]

/**
 * The Shop column is intentionally short here: apart from "All Gifts", its
 * links are the catalog's real categories, which only the backend knows. The
 * Footer loads them from `GET /api/products` and splices them in — the previous
 * hardcoded list ("Personalized Puzzles", "Custom Mugs", "QR Memory Gifts",
 * "Gift Sets") named four categories the backend has never had, so every one of
 * those links filtered the shop to nothing.
 *
 * No `title` / `label` here either, for the same reason as `primaryNav` above —
 * Footer.jsx reads them off the `footer.*` translation namespace by id. The
 * category links Footer splices in are the one exception: those come from the
 * backend as free text and are shown exactly as it returns them.
 */
export const footerNav = [
  {
    id: 'shop',
    links: [{ id: 'all', to: paths.shop }],
  },
  {
    id: 'experience',
    links: [
      { id: 'personalization', to: homeAnchor(sectionIds.personalize) },
      { id: 'qr-memory', to: homeAnchor(sectionIds.qrMemory) },
      { id: 'how-it-works', to: homeAnchor(sectionIds.howItWorks) },
      { id: 'gift-finder', to: homeAnchor(sectionIds.giftFinder) },
    ],
  },
  {
    id: 'company',
    links: [
      { id: 'about', to: paths.about },
      { id: 'contact', to: paths.contact },
      { id: 'faq', to: homeAnchor(sectionIds.faq) },
    ],
  },
  {
    id: 'help',
    links: [
      { id: 'shipping', to: paths.shipping },
      { id: 'track', to: paths.track },
      { id: 'privacy', to: paths.privacy },
      { id: 'terms', to: paths.terms },
    ],
  },
]

/**
 * Placeholder destinations — point these at the real GiftMe profiles before
 * launch, or remove the block entirely if the brand has no social presence yet.
 * No `label` here either — Footer.jsx reads the accessible name off the
 * `footer.*` translation namespace by id, same as everything else above.
 */
export const socialLinks = [
  {
    id: 'instagram',
    icon: 'instagram',
    href: 'https://www.instagram.com/',
  },
  {
    id: 'facebook',
    icon: 'facebook',
    href: 'https://www.facebook.com/',
  },
  {
    id: 'pinterest',
    icon: 'pinterest',
    href: 'https://www.pinterest.com/',
  },
]
