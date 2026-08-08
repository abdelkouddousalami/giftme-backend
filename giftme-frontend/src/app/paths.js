/**
 * Every URL the app knows about, in one place.
 *
 * Only `/` is implemented today. The rest are declared so navigation, CTAs and
 * future route registration all read from the same source — adding a page means
 * adding a <Route> in routes.jsx, never hunting for hardcoded strings.
 */

export const paths = {
  home: '/',

  shop: '/shop',
  product: (slug) => `/shop/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmed: '/order-confirmed',
  track: '/track',

  /** Public memory page opened by scanning a gift's QR code. */
  memory: (publicCode) => `/m/${publicCode}`,

  admin: {
    login: '/admin/login',
    dashboard: '/admin',
    products: '/admin/products',
    orders: '/admin/orders',
    orderDetail: (id) => `/admin/orders/${id}`,
    tracking: '/admin/tracking',
    customers: '/admin/customers',
    memories: '/admin/memories',
  },
}

/** Anchor targets on the home page, shared by nav links and section markup. */
export const sectionIds = {
  giftFinder: 'gift-finder',
  featuredGifts: 'featured-gifts',
  howItWorks: 'how-it-works',
  qrMemory: 'qr-memory',
  faq: 'faq',
}

/** Builds an in-page link that also works from another route. */
export const homeAnchor = (id) => `${paths.home}#${id}`
