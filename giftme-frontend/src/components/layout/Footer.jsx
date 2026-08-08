import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import Icon from '../common/Icon.jsx'
import Brand from './Brand.jsx'
import { footerNav, socialLinks } from '../../data/navigation.js'
import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <Container>
        <div className="footer__top">
          <div className="footer__brand">
            <Brand tone="inverse" size="lg" />
            <p className="footer__tagline">More than a gift, a memory.</p>

            <ul className="footer__social">
              {socialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    className="footer__social-link"
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name={social.icon} size={18} />
                    <span className="sr-only">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerNav.map((column) => (
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

        <div className="footer__bottom">
          <p>© {year} GiftMe. All rights reserved.</p>
          <p>Handmade to order · Delivered across Morocco</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
