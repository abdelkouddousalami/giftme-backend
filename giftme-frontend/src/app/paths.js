/**
 * Every URL the app knows about, in one place.
 *
 * Navigation, CTAs and route registration all read from here — adding a page
 * means adding a <Route> in routes.jsx, never hunting for hardcoded strings.
 * Anything not routed falls through to <NotFoundPage />.
 *
 * The editorial pages (`about`, `contact`, `shipping`, `privacy`, `terms`) are
 * declared but not routed: they are static copy with no backend behind them,
 * and the brief's scope is connecting the storefront to the API.
 */

export const paths = {
  home: '/',

  shop: '/shop',
  product: (slug) => `/shop/${slug}`,
  /**
   * A shop view filtered to one category. The value is the backend's own
   * `product.category` string (e.g. "Mugs"), which is what `GET /api/products`
   * matches on — there is no separate category slug anywhere in the schema.
   */
  category: (category) => `/shop?category=${encodeURIComponent(category)}`,
  cart: '/cart',
  checkout: '/checkout',
  /** Reached with the created order in router state; falls back to /track. */
  orderConfirmed: '/order-confirmed',
  track: '/track',
  trackCode: (code) => `/track?code=${encodeURIComponent(code)}`,

  account: '/account',
  login: '/login',
  register: '/register',

  about: '/about',
  contact: '/contact',
  shipping: '/shipping',
  privacy: '/privacy',
  terms: '/terms',

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

/**
 * Anchor targets on the home page, shared by nav links and section markup.
 * The order below is the order they appear on the page.
 */
export const sectionIds = {
  gifts: 'gifts',
  giftFinder: 'gift-finder',
  personalize: 'personalize',
  qrMemory: 'qr-memory',
  howItWorks: 'how-it-works',
  showcase: 'showcase',
  reviews: 'reviews',
  faq: 'faq',
}

/** Builds an in-page link that also works from another route. */
export const homeAnchor = (id) => `${paths.home}#${id}`
