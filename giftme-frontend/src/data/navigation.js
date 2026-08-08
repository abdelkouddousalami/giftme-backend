import { paths, homeAnchor, sectionIds } from '../app/paths'

export const primaryNav = [
  { id: 'shop', label: 'Shop', to: paths.shop },
  {
    id: 'how-it-works',
    label: 'How It Works',
    to: homeAnchor(sectionIds.howItWorks),
  },
  { id: 'track', label: 'Track Order', to: paths.track },
]

export const footerNav = [
  {
    id: 'explore',
    title: 'Explore',
    links: [
      { id: 'shop', label: 'Shop', to: paths.shop },
      { id: 'how-it-works', label: 'How It Works', to: homeAnchor(sectionIds.howItWorks) },
      { id: 'qr-memory', label: 'QR Memory', to: homeAnchor(sectionIds.qrMemory) },
      { id: 'track', label: 'Track Order', to: paths.track },
      { id: 'faq', label: 'FAQ', to: homeAnchor(sectionIds.faq) },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    links: [
      { id: 'contact', label: 'Contact', to: '/contact' },
      { id: 'delivery', label: 'Delivery', to: '/delivery' },
      { id: 'privacy', label: 'Privacy', to: '/privacy' },
      { id: 'terms', label: 'Terms', to: '/terms' },
    ],
  },
]

/**
 * Placeholder destinations — point these at the real GiftMe profiles before
 * launch, or remove the block entirely if the brand has no social presence yet.
 */
export const socialLinks = [
  { id: 'instagram', label: 'GiftMe on Instagram', icon: 'instagram', href: 'https://www.instagram.com/' },
  { id: 'facebook', label: 'GiftMe on Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
  { id: 'pinterest', label: 'GiftMe on Pinterest', icon: 'pinterest', href: 'https://www.pinterest.com/' },
]
