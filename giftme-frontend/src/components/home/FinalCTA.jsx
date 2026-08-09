import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import { paths, sectionIds } from '../../app/paths.js'
import './FinalCTA.css'

/**
 * The page's last word: one sand panel, centred, echoing the hero's
 * composition so the scroll ends where it began. The two decorative rings that
 * used to float in it are gone — depth here is a warm gradient and a tile of
 * grain, the same two devices the hero uses.
 */
function FinalCTA() {
  const { t } = useTranslation()
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <Container>
        <Reveal className="final-cta__panel">
          <span aria-hidden="true" className="grain" />

          <div className="final-cta__content">
            <p className="eyebrow eyebrow--centered">{t('home.finalCta.eyebrow')}</p>

            <h2 id="final-cta-title" className="final-cta__title">
              {t('home.finalCta.titleLine1')} <em>{t('home.finalCta.titleEm')}</em>
            </h2>

            <p className="final-cta__lead">{t('home.finalCta.lead')}</p>

            <div className="final-cta__actions">
              <Button to={paths.shop} size="lg" trailingIcon="arrowRight">
                {t('home.finalCta.cta')}
              </Button>

              <Link
                to={`${paths.home}#${sectionIds.gifts}`}
                className="final-cta__link group"
              >
                <span className="relative">
                  <span>{t('home.finalCta.browseAll')}</span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 block h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-brand group-hover:scale-x-100 rtl:right-0 rtl:left-auto rtl:origin-right"
                  />
                </span>
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform duration-200 ease-brand group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default FinalCTA
