import i18n from '../i18n/index.js'

/**
 * Gift Finder content + matching rules.
 *
 * The quiz itself is a front-end affordance — there is no recommendation
 * endpoint on the backend, and inventing one is out of scope. What it must NOT
 * do is recommend an imaginary product: every answer it can give resolves to a
 * real `ProductResponse` fetched from `GET /api/products`, matched on the
 * product's own `slug`.
 *
 * It used to run against a hardcoded catalog whose prices had drifted well away
 * from the real ones, so the budget step steered shoppers toward gifts that cost
 * something else entirely. The budget bands are now derived from the live
 * catalog's actual price range instead of being written down here.
 *
 * Every label/note/question below reads through the i18next singleton
 * directly rather than the `useTranslation` hook — this module is plain data,
 * not a component, but still needs to answer in whatever language is active
 * *right now* each time these functions run. Callers that memoize the result
 * (GiftFinderSection does) must list `i18n.language` as a dependency, or a
 * language switch won't invalidate the memo.
 *
 * MISSING API: a real recommendation service would replace `recommendGift`
 * wholesale; only that function and `buildBudgetOptions` would have to change.
 */

/** Backend product slugs this quiz knows how to speak about by name. */
const PUZZLE = 'personalized-puzzle'
const MUG = 'personalized-mug'
const QR_MEMORY = 'qr-memory-experience'

export function recipientStep() {
  return {
    id: 'recipient',
    index: '01',
    /** Short label for the progress rail — the question is too long to fit. */
    name: i18n.t('home.giftFinder.recipient.name'),
    question: i18n.t('home.giftFinder.recipient.question'),
    options: [
      { value: 'partner', label: i18n.t('home.giftFinder.recipient.partner'), icon: 'heart' },
      { value: 'friend', label: i18n.t('home.giftFinder.recipient.friend'), icon: 'users' },
      { value: 'mom', label: i18n.t('home.giftFinder.recipient.mom'), icon: 'home' },
      { value: 'dad', label: i18n.t('home.giftFinder.recipient.dad'), icon: 'person' },
      { value: 'family', label: i18n.t('home.giftFinder.recipient.family'), icon: 'family' },
    ],
  }
}

export function occasionStep() {
  return {
    id: 'occasion',
    index: '02',
    name: i18n.t('home.giftFinder.occasion.name'),
    question: i18n.t('home.giftFinder.occasion.question'),
    options: [
      { value: 'birthday', label: i18n.t('home.giftFinder.occasion.birthday'), icon: 'cake' },
      { value: 'anniversary', label: i18n.t('home.giftFinder.occasion.anniversary'), icon: 'rings' },
      { value: 'thank-you', label: i18n.t('home.giftFinder.occasion.thankYou'), icon: 'envelope' },
      { value: 'just-because', label: i18n.t('home.giftFinder.occasion.justBecause'), icon: 'sparkle' },
    ],
  }
}

/**
 * The budget step, computed from the catalog the backend is actually selling.
 *
 * Splitting the real min–max price range into three keeps every band reachable:
 * a band nobody can spend into is worse than no budget question at all, which
 * is exactly what the old hardcoded "250+ DH" tier had become against a catalog
 * whose most expensive gift is 179.
 *
 * @param {Array<{price: number}>} products live products from the API
 */
export function buildBudgetOptions(products) {
  const prices = [...new Set(products.map((product) => Number(product.price)))]
    .filter((price) => Number.isFinite(price))
    .sort((a, b) => a - b)

  if (prices.length === 0) return []

  // One price point (or a catalog of identical prices) can't be split into
  // bands — asking about budget would be theatre, so offer a single honest one.
  if (prices.length === 1) {
    return [
      {
        value: 'any',
        label: `${prices[0]} MAD`,
        note: i18n.t('home.giftFinder.budget.everything'),
        min: 0,
        max: Infinity,
      },
    ]
  }

  const min = prices[0]
  const max = prices.at(-1)
  const third = (max - min) / 3
  const lowCut = Math.round(min + third)
  const midCut = Math.round(min + third * 2)

  return [
    {
      value: 'low',
      label: i18n.t('home.giftFinder.budget.upTo', { amount: lowCut }),
      note: i18n.t('home.giftFinder.budget.small'),
      min: 0,
      max: lowCut,
    },
    {
      value: 'mid',
      label: i18n.t('home.giftFinder.budget.range', { min: lowCut, max: midCut }),
      note: i18n.t('home.giftFinder.budget.loved'),
      min: lowCut,
      max: midCut,
    },
    {
      value: 'high',
      label: i18n.t('home.giftFinder.budget.andUp', { amount: midCut }),
      note: i18n.t('home.giftFinder.budget.full'),
      min: midCut,
      max: Infinity,
    },
  ]
}

/** The three steps, with the budget options derived from the live catalog. */
export function buildGiftFinderSteps(products) {
  return [
    recipientStep(),
    occasionStep(),
    {
      id: 'budget',
      index: '03',
      name: i18n.t('home.giftFinder.budget.name'),
      question: i18n.t('home.giftFinder.budget.question'),
      /* No icons here on purpose: the last step should feel lighter than the two
         that precede it, so it reads as a final detail rather than a third quiz. */
      options: buildBudgetOptions(products),
    },
  ]
}

/** The recipient + occasion pairs worth answering by hand. */
const PAIR_MATCH = {
  'partner:anniversary': PUZZLE,
  'partner:birthday': PUZZLE,
  'partner:just-because': QR_MEMORY,
  'friend:birthday': MUG,
  'friend:thank-you': MUG,
  'mom:thank-you': QR_MEMORY,
  'mom:birthday': PUZZLE,
  'dad:birthday': MUG,
  'dad:thank-you': MUG,
  'family:anniversary': QR_MEMORY,
  'family:just-because': QR_MEMORY,
}

/** Everything the pairs above don't name falls back to the occasion alone. */
const OCCASION_MATCH = {
  birthday: PUZZLE,
  anniversary: PUZZLE,
  'thank-you': MUG,
  'just-because': QR_MEMORY,
}

function reasonsBySlug() {
  return {
    [MUG]: i18n.t('home.giftFinder.reasons.mug'),
    [PUZZLE]: i18n.t('home.giftFinder.reasons.puzzle'),
    [QR_MEMORY]: i18n.t('home.giftFinder.reasons.qrMemory'),
  }
}

/**
 * Copy for the pairs that deserve more than the product's stock sentence. Only
 * used when the budget hasn't moved the answer somewhere else — a line about a
 * puzzle would read as a mistake above a photo of a mug.
 */
function pairReasons() {
  return {
    'partner:anniversary': i18n.t('home.giftFinder.reasons.partnerAnniversary'),
    'partner:just-because': i18n.t('home.giftFinder.reasons.partnerJustBecause'),
    'friend:birthday': i18n.t('home.giftFinder.reasons.friendBirthday'),
    'mom:thank-you': i18n.t('home.giftFinder.reasons.momThankYou'),
    'dad:birthday': i18n.t('home.giftFinder.reasons.dadBirthday'),
    'family:just-because': i18n.t('home.giftFinder.reasons.familyJustBecause'),
  }
}

const inBand = (product, band) =>
  !band || (Number(product.price) >= band.min && Number(product.price) <= band.max)

/**
 * @param {{recipient: string, occasion: string, budget: string}} answers
 * @param {Array<object>} products live ProductResponse list
 * @returns {{product: object, reason: string} | null} null when the catalog is empty
 */
export function recommendGift(answers, products) {
  if (!products?.length) return null

  const { recipient, occasion, budget } = answers
  const pair = `${recipient}:${occasion}`
  const preferredSlug = PAIR_MATCH[pair] ?? OCCASION_MATCH[occasion]

  const bySlug = (slug) => products.find((product) => product.slug === slug)
  // The named slugs are the seeded catalog; if an admin renames or retires one,
  // fall through to whatever the catalog actually holds rather than 404-ing.
  const preferred = bySlug(preferredSlug) ?? products[0]

  const band = buildBudgetOptions(products).find((option) => option.value === budget)

  let product = preferred
  if (!inBand(preferred, band)) {
    const affordable = products.filter((candidate) => inBand(candidate, band))
    // Budget is a range, not a ceiling: someone who picked the top band is not
    // helped by the cheapest gift either, so take the most substantial one that
    // actually sits inside it.
    if (affordable.length > 0) {
      product = affordable.reduce(
        (best, candidate) => (Number(candidate.price) > Number(best.price) ? candidate : best),
        affordable[0],
      )
    }
  }

  const keptThePair = product.slug === PAIR_MATCH[pair]
  const reason =
    (keptThePair ? pairReasons()[pair] : null) ??
    reasonsBySlug()[product.slug] ??
    // An unknown product still gets a truthful line — its own backend copy.
    product.shortDescription ??
    product.description

  return { product, reason }
}
