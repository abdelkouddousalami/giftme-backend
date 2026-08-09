import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import Icon from '../common/Icon.jsx'
import BrandLogo from '../common/BrandLogo.jsx'
import { footerNav, socialLinks } from '../../data/navigation.js'
import { listCategories } from '../../api/products.js'
import { useAsync } from '../../hooks/useAsync.js'
import { paths } from '../../app/paths.js'
import './Footer.css'

/** footerNav/socialLinks carry no label of their own (see data/navigation.js) -
 * each id maps to a `footer.*` translation key here instead. Category links
 * are the one exception: those come back from the backend as free text and
 * are shown exactly as it returns them. */
const COLUMN_TITLE_KEYS = {
  shop: 'footer.shopTitle',
  experience: 'footer.experienceTitle',
  company: 'footer.companyTitle',
  help: 'footer.helpTitle',
}

const LINK_LABEL_KEYS = {
  all: 'footer.allGifts',
  personalization: 'footer.personalization',
  'qr-memory': 'footer.qrMemory',
  'how-it-works': 'footer.howItWorks',
  'gift-finder': 'footer.giftFinder',
  about: 'footer.ourStory',
  contact: 'footer.contact',
  faq: 'footer.faq',
  shipping: 'footer.shipping',
  track: 'footer.trackOrder',
  privacy: 'footer.privacy',
  terms: 'footer.terms',
}

const SOCIAL_LABEL_KEYS = {
  instagram: 'footer.instagram',
  facebook: 'footer.facebook',
  pinterest: 'footer.pinterest',
}

/**
 * The page's bottom edge, and the second of the two ink bands that anchor it
 * (the QR memory section is the first). Four columns of real destinations —
 * what you can buy, what you can add to it, who we are, and how to get help —
 * so the footer closes the page as a shop rather than trailing off.
 *
 * The Shop column's category links come from the catalog itself, so they can
 * never name a category the backend does not sell. A failed or empty category
 * load simply leaves "All Gifts" standing: a footer is navigation, and dropping
 * an error box into the page's bottom edge would be worse than the missing
 * links it reports.
 */
function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const { data: categories } = useAsync(() => listCategories(), [])

  const columns = useMemo(
    () =>
      footerNav.map((column) =>
        column.id === 'shop'
          ? {
              ...column,
              links: [
                ...column.links,
                ...(categories ?? []).map((category) => ({
                  id: `category-${category.name}`,
                  label: category.name,
                  to: paths.category(category.name),
                })),
              ],
            }
          : column,
      ),
    [categories],
  )

  return (
    <footer className="footer">
      <span aria-hidden="true" className="grain grain--dark" />

      <Container className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <BrandLogo variant="light" size="lg" />

            <p className="footer__tagline">{t('footer.tagline')}</p>

            <ul className="footer__social">
              {socialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    className="footer__social-link"
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name={social.icon} size={17} />
                    <span className="sr-only">{t(SOCIAL_LABEL_KEYS[social.id])}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__columns">
            {columns.map((column) => {
              const title = t(COLUMN_TITLE_KEYS[column.id])
              return (
                <nav key={column.id} className="footer__column" aria-label={title}>
                  <h2 className="footer__column-title">{title}</h2>
                  <ul className="footer__list">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        <Link className="footer__link" to={link.to}>
                          {LINK_LABEL_KEYS[link.id] ? t(LINK_LABEL_KEYS[link.id]) : link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )
            })}
          </div>
        </div>

        <div className="footer__bottom">
          <p>{t('footer.rights', { year })}</p>
          <p>{t('footer.madeToOrder')}</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
