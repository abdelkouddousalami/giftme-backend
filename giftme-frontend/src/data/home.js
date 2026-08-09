/** Static editorial content for the home page sections. */

/**
 * The trust bar under the hero. Each promise carries a second line, because a
 * bare "cash on delivery" is a claim and "pay the courier when it reaches your
 * door" is an answer to the question the shopper was actually asking.
 */
export const trustPoints = [
  {
    id: 'preview',
    icon: 'pen',
    title: 'Free personalization preview',
    note: 'See your gift before anything is printed.',
  },
  {
    id: 'cash',
    icon: 'cash',
    title: 'Cash on delivery',
    note: 'Pay the courier when it reaches your door.',
  },
  {
    id: 'delivery',
    icon: 'truck',
    title: 'Delivered in 3–5 days',
    note: 'Made to order in 1–2, shipped nationwide.',
  },
]

/**
 * What "personalized" actually means here, in the order a customer meets it in
 * the editor. Four layers, not four features — the last one is the reason the
 * QR section exists.
 */
export const personalLayers = [
  {
    id: 'names',
    icon: 'type',
    title: 'Their name, your words',
    description:
      'Names, dates, an inside joke — set in the same typography as the gift itself.',
  },
  {
    id: 'photo',
    icon: 'photo',
    title: 'The photo you already have in mind',
    description:
      'Upload it, crop it, and see the print proof before a single piece is cut.',
  },
  {
    id: 'message',
    icon: 'message',
    title: 'A message on the card',
    description:
      'Printed on the keepsake card that travels inside the box, in your handwriting or ours.',
  },
  {
    id: 'memory',
    icon: 'qr',
    title: 'A private QR memory',
    description:
      'Photos, a voice note and a video, hidden behind the small tag on the gift.',
  },
]

export const steps = [
  {
    id: 'choose',
    number: '01',
    title: 'Choose your gift',
    description:
      'A puzzle, a mug, a QR memory or a boxed set. Every piece is made to order.',
  },
  {
    id: 'personalize',
    number: '02',
    title: 'Make it personal',
    description:
      'Add the photo, the names and the message — then the private memory behind the tag.',
  },
  {
    id: 'deliver',
    number: '03',
    title: 'We create & deliver it',
    description:
      'Printed and packed by hand in 1–2 days, at your door in 3–5, paid on delivery.',
  },
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
  {
    id: 'made-to-order',
    icon: 'pen',
    title: 'Made to order',
    description:
      'Nothing is printed before you order it. Your photo is proofed by eye, then it goes on the press.',
  },
  {
    id: 'cod',
    icon: 'cash',
    title: 'Pay on delivery',
    description:
      'No card, no account, no prepayment. You pay in cash when the gift is in your hands.',
  },
  {
    id: 'tracked',
    icon: 'truck',
    title: 'Tracked to the door',
    description:
      'Every order carries its own code. Follow it from the press to the doorstep, no sign-in needed.',
  },
  {
    id: 'memory',
    icon: 'qr',
    title: 'A memory behind the tag',
    description:
      'Add a private page of photos, video and voice that they open by scanning the gift itself.',
  },
]

/** What a recipient finds after scanning — used by the phone preview. */
export const memoryLayers = [
  { id: 'photos', icon: 'photo', label: 'Photos' },
  { id: 'video', icon: 'play', label: 'Video' },
  { id: 'audio', icon: 'music', label: 'Voice & music' },
  { id: 'message', icon: 'message', label: 'Your message' },
]

export const scanFlow = [
  {
    id: 'scan',
    title: 'They scan the tag',
    description: 'With the camera they already have. No app, no account.',
  },
  {
    id: 'open',
    title: 'A private page opens',
    description: 'Reachable only from their link — nothing is public.',
  },
  {
    id: 'relive',
    title: 'They come back to it',
    description: 'Months later, on a bad day, on the anniversary of it.',
  },
]

/**
 * The editorial showcase under "How it works" — craft notes, not product
 * listings. The prices and CTAs live in the shop grid above; this band exists
 * to make the work look like it was made by someone.
 */
export const craftNotes = [
  {
    id: 'print',
    label: 'The print',
    text: 'Colour-matched to your photo, proofed by eye before it goes on the press.',
  },
  {
    id: 'box',
    label: 'The box',
    text: 'Rigid, lined, and closed with a ribbon — so the opening is part of the gift.',
  },
  {
    id: 'tag',
    label: 'The tag',
    text: 'Kraft card, hand-tied, carrying the code to a page only they can reach.',
  },
]
