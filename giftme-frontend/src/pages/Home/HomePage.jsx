import HeroSection from '../../components/home/HeroSection.jsx'
import TrustBar from '../../components/home/TrustBar.jsx'
import ShopByGift from '../../components/home/ShopByGift.jsx'
import GiftFinderSection from '../../components/home/GiftFinder/GiftFinderSection.jsx'
import Personalization from '../../components/home/Personalization.jsx'
import QRMemorySection from '../../components/home/QRMemorySection.jsx'
import HowItWorks from '../../components/home/HowItWorks.jsx'
import ProductShowcase from '../../components/home/ProductShowcase.jsx'
import SocialProof from '../../components/home/SocialProof.jsx'
import FAQSection from '../../components/home/FAQSection.jsx'
import FinalCTA from '../../components/home/FinalCTA.jsx'

/**
 * The home page is only a running order. Every section owns its own markup,
 * styles and state, so sections can be reordered or reused on other pages
 * without touching this file.
 *
 * The order is a narrative and a colour rhythm at the same time:
 *
 *   hero            ivory   what this is
 *   trust bar       bone    can I trust it
 *   shop            ivory   what can I buy
 *   gift finder     bone    help me choose
 *   personalization ivory   what makes it mine
 *   QR memory       INK     what makes it unlike anything else
 *   how it works    ivory   what do I actually have to do
 *   showcase        ivory   what does the finished thing look like
 *   social proof    bone    who else has done this
 *   FAQ             ivory   the last objections
 *   final CTA       ivory   ask
 *
 * The two bone bands and the single ink band are the only ground changes on
 * the page; everything else is one continuous sheet of ivory. That is what
 * stops eleven sections reading as eleven templates.
 */
function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ShopByGift />
      <GiftFinderSection />
      <Personalization />
      <QRMemorySection />
      <HowItWorks />
      <ProductShowcase />
      <SocialProof />
      <FAQSection />
      <FinalCTA />
    </>
  )
}

export default HomePage
