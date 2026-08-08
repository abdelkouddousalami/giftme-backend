import HeroSection from '../../components/home/HeroSection.jsx'
import GiftFinderSection from '../../components/home/GiftFinderSection.jsx'
import FeaturedGifts from '../../components/home/FeaturedGifts.jsx'
import HowItWorks from '../../components/home/HowItWorks.jsx'
import QRMemorySection from '../../components/home/QRMemorySection.jsx'
import WhyGiftMe from '../../components/home/WhyGiftMe.jsx'
import ReviewsSection from '../../components/home/ReviewsSection.jsx'
import FAQSection from '../../components/home/FAQSection.jsx'
import FinalCTA from '../../components/home/FinalCTA.jsx'

/**
 * The home page is only a running order. Every section owns its own markup,
 * styles and state, so sections can be reordered or reused on other pages
 * without touching this file.
 */
function HomePage() {
  return (
    <>
      <HeroSection />
      <GiftFinderSection />
      <FeaturedGifts />
      <HowItWorks />
      <QRMemorySection />
      <WhyGiftMe />
      <ReviewsSection />
      <FAQSection />
      <FinalCTA />
    </>
  )
}

export default HomePage
