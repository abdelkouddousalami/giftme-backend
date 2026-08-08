/**
 * Gift Finder content + matching rules.
 *
 * This is a front-end prototype: the recommendation is a pure function over the
 * three answers, with no backend involved. Keeping the rules here means the
 * component stays presentational and the logic stays testable.
 */

export const giftFinderQuestions = [
  {
    id: 'recipient',
    legend: 'Who is it for?',
    options: [
      { value: 'partner', label: 'Partner' },
      { value: 'friend', label: 'Friend' },
      { value: 'mom', label: 'Mom' },
      { value: 'dad', label: 'Dad' },
      { value: 'family', label: 'Family' },
    ],
  },
  {
    id: 'occasion',
    legend: 'What is the occasion?',
    options: [
      { value: 'birthday', label: 'Birthday' },
      { value: 'anniversary', label: 'Anniversary' },
      { value: 'thank-you', label: 'Thank You' },
      { value: 'just-because', label: 'Just Because' },
    ],
  },
  {
    id: 'budget',
    legend: "What's your budget?",
    options: [
      { value: 'under-150', label: 'Under 150 DH' },
      { value: '150-250', label: '150–250 DH' },
      { value: '250-plus', label: '250+ DH' },
    ],
  },
]

const BUDGET_MATCH = {
  'under-150': 'personalized-mug',
  '150-250': 'personalized-puzzle',
  '250-plus': 'qr-memory-experience',
}

const REASONS = {
  'personalized-mug':
    'Small, personal and used every single day — the kind of gift that keeps showing up.',
  'personalized-puzzle':
    'A moment they can hold, piece together, and keep long after the day is over.',
  'qr-memory-experience':
    'Photos, a voice note and a video behind one scan — the whole story, not just one frame.',
}

/** Human-readable label for a stored answer value. */
const labelFor = (questionId, value) =>
  giftFinderQuestions
    .find((question) => question.id === questionId)
    ?.options.find((option) => option.value === value)?.label ?? ''

/**
 * Budget is the hard constraint — we never suggest something above the range
 * the customer picked. Occasion only refines the choice inside that range.
 *
 * @param {{recipient: string, occasion: string, budget: string}} answers
 * @returns {{productId: string, reason: string, summary: string[]}}
 */
export function recommendGift(answers) {
  const { recipient, occasion, budget } = answers

  let productId = BUDGET_MATCH[budget] ?? 'personalized-puzzle'

  // At the top tier, a thank-you reads better as an object than as an archive —
  // unless it is for a partner, where the memory page still wins.
  if (
    budget === '250-plus' &&
    occasion === 'thank-you' &&
    recipient !== 'partner'
  ) {
    productId = 'personalized-puzzle'
  }

  return {
    productId,
    reason: REASONS[productId],
    summary: [
      labelFor('recipient', recipient),
      labelFor('occasion', occasion),
      labelFor('budget', budget),
    ].filter(Boolean),
  }
}
