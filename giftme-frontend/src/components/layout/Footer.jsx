import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import Icon from '../common/Icon.jsx'
import BrandLogo from '../common/BrandLogo.jsx'
import { footerNav, socialLinks } from '../../data/navigation.js'
import { listCategories } from '../../api/products.js'
import { useAsync } from '../../hooks/useAsync.js'
import { paths } from '../../app/paths.js'
import './Footer.css'

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

            <p className="footer__tagline">
              Personalized gifts, made to mean more — each one printed, packed
              and tied by hand.
            </p>

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
                    <span className="sr-only">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__columns">
            {columns.map((column) => (
              <nav
                key={column.id}
                className="footer__column"
                aria-label={column.title}
              >
                <h2 className="footer__column-title">{column.title}</h2>
                <ul className="footer__list">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <Link className="footer__link" to={link.to}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {year} GiftMe. All rights reserved.</p>
          <p>Made to order · Cash on delivery · Delivered across Morocco</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
