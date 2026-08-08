/** Static editorial content for the home page sections. */

export const steps = [
  {
    id: 'choose',
    number: '01',
    icon: 'gift',
    title: 'Choose your gift',
    description: 'A puzzle, a mug, or the full QR Memory experience.',
  },
  {
    id: 'personalize',
    number: '02',
    icon: 'pen',
    title: 'Make it personal',
    description: 'Add the photo and the words only you would write.',
  },
  {
    id: 'memory',
    number: '03',
    icon: 'qr',
    title: 'Add your memory',
    description: 'Photos, a video, a voice note — everything behind one scan.',
  },
  {
    id: 'give',
    number: '04',
    icon: 'heart',
    title: 'Give it meaning',
    description: 'It arrives wrapped, ready for the moment you planned.',
  },
]

export const benefits = [
  {
    id: 'personalized',
    icon: 'pen',
    title: 'Personalized',
    description: 'Made specifically for them.',
  },
  {
    id: 'made-with-love',
    icon: 'heart',
    title: 'Made With Love',
    description: 'Every detail has a meaning.',
  },
  {
    id: 'qr-memory',
    icon: 'qr',
    title: 'QR Memory',
    description: 'Turn a gift into a story.',
  },
  {
    id: 'reliable',
    icon: 'truck',
    title: 'Easy & Reliable',
    description: 'Simple ordering and delivery.',
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
  { id: 'scan', title: 'They scan the tag', description: 'No app, no account.' },
  {
    id: 'open',
    title: 'A private page opens',
    description: 'Only reachable with their link.',
  },
  {
    id: 'relive',
    title: 'They relive the moment',
    description: 'And can come back to it any time.',
  },
]
