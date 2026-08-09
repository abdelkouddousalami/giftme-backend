import { paths, homeAnchor, sectionIds } from '../app/paths'

/**
 * The four things a shopper needs from a gift storefront: what you sell, what
 * makes it yours, how it reaches them, and who you are.
 *
 * Three of the four resolve to real sections on the home page today. "Our
 * Story" points at `/about`, which is declared in paths.js but not yet routed —
 * see the note at the top of that file.
 */
export const primaryNav = [
  { id: 'shop', label: 'Shop Gifts', to: homeAnchor(sectionIds.gifts) },
  {
    id: 'personalized',
    label: 'Personalized',
    to: homeAnchor(sectionIds.personalize),
  },
  {
    id: 'how-it-works',
    label: 'How It Works',
    to: homeAnchor(sectionIds.howItWorks),
  },
  { id: 'story', label: 'Our Story', to: paths.about },
]

/**
 * The Shop column is intentionally short here: apart from "All Gifts", its
 * links are the catalog's real categories, which only the backend knows. The
 * Footer loads them from `GET /api/products` and splices them in — the previous
 * hardcoded list ("Personalized Puzzles", "Custom Mugs", "QR Memory Gifts",
 * "Gift Sets") named four categories the backend has never had, so every one of
 * those links filtered the shop to nothing.
 */
export const footerNav = [
  {
    id: 'shop',
    title: 'Shop',
    links: [{ id: 'all', label: 'All Gifts', to: paths.shop }],
  },
  {
    id: 'experience',
    title: 'Experience',
    links: [
      {
        id: 'personalization',
        label: 'Personalization',
        to: homeAnchor(sectionIds.personalize),
      },
      { id: 'qr-memory', label: 'QR Memory', to: homeAnchor(sectionIds.qrMemory) },
      {
        id: 'how-it-works',
        label: 'How It Works',
        to: homeAnchor(sectionIds.howItWorks),
      },
      {
        id: 'gift-finder',
        label: 'Gift Finder',
        to: homeAnchor(sectionIds.giftFinder),
      },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    links: [
      { id: 'about', label: 'Our Story', to: paths.about },
      { id: 'contact', label: 'Contact', to: paths.contact },
      { id: 'faq', label: 'FAQ', to: homeAnchor(sectionIds.faq) },
    ],
  },
  {
    id: 'help',
    title: 'Help',
    links: [
      { id: 'shipping', label: 'Shipping & Delivery', to: paths.shipping },
      { id: 'track', label: 'Track Order', to: paths.track },
      { id: 'privacy', label: 'Privacy', to: paths.privacy },
      { id: 'terms', label: 'Terms', to: paths.terms },
    ],
  },
]

/**
 * Placeholder destinations — point these at the real GiftMe profiles before
 * launch, or remove the block entirely if the brand has no social presence yet.
 */
export const socialLinks = [
  {
    id: 'instagram',
    label: 'GiftMe on Instagram',
    icon: 'instagram',
    href: 'https://www.instagram.com/',
  },
  {
    id: 'facebook',
    label: 'GiftMe on Facebook',
    icon: 'facebook',
    href: 'https://www.facebook.com/',
  },
  {
    id: 'pinterest',
    label: 'GiftMe on Pinterest',
    icon: 'pinterest',
    href: 'https://www.pinterest.com/',
  },
]
