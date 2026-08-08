import { images } from '../assets/images'

/** Currency is Moroccan dirham; kept on the product so formatting stays local. */
export const products = [
  {
    id: 'personalized-puzzle',
    slug: 'personalized-puzzle',
    name: 'Personalized Puzzle',
    tagline: 'Turn your favorite moment into something they can hold.',
    detail:
      'Your photo, printed on 500 sturdy pieces and delivered in a linen keepsake box.',
    price: 199,
    currency: 'DH',
    image: images.productPuzzle,
    imageAlt:
      'A personalized photo puzzle of a couple at sunset, with one loose piece beside it',
    badge: null,
  },
  {
    id: 'personalized-mug',
    slug: 'personalized-mug',
    name: 'Personalized Mug',
    tagline: 'A little reminder for every morning.',
    detail:
      'Ceramic, dishwasher safe, and printed with the photo or the words they need to read at 7am.',
    price: 129,
    currency: 'DH',
    image: images.productMug,
    imageAlt:
      'A white ceramic mug printed with a photo band and a small rose heart',
    badge: null,
  },
  {
    id: 'qr-memory-experience',
    slug: 'qr-memory-experience',
    name: 'QR Memory Experience',
    tagline: 'Give them a memory they can revisit anytime.',
    detail:
      'A private page of photos, video, voice notes and words — opened by scanning the tag on their gift.',
    price: 279,
    currency: 'DH',
    image: images.productQrMemory,
    imageAlt:
      'A printed QR card resting on a photo print, ready to be attached to a gift',
    badge: 'Signature',
  },
]

export const formatPrice = ({ price, currency }) => `${price} ${currency}`

export const getProductById = (id) =>
  products.find((product) => product.id === id)
