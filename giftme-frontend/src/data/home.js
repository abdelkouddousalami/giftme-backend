/**
 * Static structure for the home page sections — ids, icons and numbers only.
 * Every title/description/label/note lives in the `home.*` translation
 * namespace instead, keyed by each entry's `id`, so this file doesn't need to
 * change per language. See each consuming component for the exact key it
 * reads (e.g. TrustBar reads `home.trustBar.previewTitle` for id "preview").
 */

/** The trust bar under the hero. */
export const trustPoints = [
  { id: 'preview', icon: 'pen' },
  { id: 'cash', icon: 'cash' },
  { id: 'delivery', icon: 'truck' },
]

/**
 * What "personalized" actually means here, in the order a customer meets it in
 * the editor. Four layers, not four features — the last one is the reason the
 * QR section exists.
 */
export const personalLayers = [
  { id: 'names', icon: 'type' },
  { id: 'photo', icon: 'photo' },
  { id: 'message', icon: 'message' },
  { id: 'memory', icon: 'qr' },
]

export const steps = [
  { id: 'choose', number: '01' },
  { id: 'personalize', number: '02' },
  { id: 'deliver', number: '03' },
]

/**
 * The social-proof band's four promises.
 *
 * This replaced a set of invented headline figures ("10K+ gifts delivered",
 * "4.8/5 average rating") that no system produced and nobody had verified.
 * Every line below is instead a statement about how the backend actually
 * behaves, so it stays true without anyone having to maintain a number:
 *
 *   made to order      — a Product is only ever printed against a real Order
 *   cash on delivery   — PaymentMethod is a one-value enum, COD
 *   tracked end to end  — every order gets a GM-XXXXXX tracking code, and every
 *                         status change appends a TrackingEvent (rule #8)
 *   about five days     — OrderServiceImpl.ESTIMATED_DELIVERY_DAYS = 5, which is
 *                         what the API returns as `estimatedDelivery`
 *
 * See the MISSING API note in components/home/SocialProof.jsx about reviews.
 */
export const servicePromises = [
  { id: 'made-to-order', icon: 'pen' },
  { id: 'cod', icon: 'cash' },
  { id: 'tracked', icon: 'truck' },
  { id: 'memory', icon: 'qr' },
]

/** What a recipient finds after scanning — used by the phone preview. */
export const memoryLayers = [
  { id: 'photos', icon: 'photo' },
  { id: 'video', icon: 'play' },
  { id: 'audio', icon: 'music' },
  { id: 'message', icon: 'message' },
]

export const scanFlow = [{ id: 'scan' }, { id: 'open' }, { id: 'relive' }]

/**
 * The editorial showcase under "How it works" — craft notes, not product
 * listings. The prices and CTAs live in the shop grid above; this band exists
 * to make the work look like it was made by someone.
 */
export const craftNotes = [{ id: 'print' }, { id: 'box' }, { id: 'tag' }]
