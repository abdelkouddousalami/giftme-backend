import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Brand from './Brand.jsx'
import { primaryNav } from '../../data/navigation.js'
import { paths } from '../../app/paths.js'
import './Header.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Shared by the desktop drawer and the mobile menu — declared once. */
function SearchForm({ id, inputRef, value, onChange, onSubmit }) {
  return (
    <form className="header-search" role="search" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        Search gifts
      </label>
      <Icon name="search" size={18} className="header-search__icon" />
      <input
        id={id}
        ref={inputRef}
        className="header-search__input"
        type="search"
        placeholder="Search puzzles, mugs, QR memories…"
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      <button type="submit" className="header-search__submit">
        Search
      </button>
    </form>
  )
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [query, setQuery] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const menuButtonRef = useRef(null)
  const searchButtonRef = useRef(null)
  const menuPanelRef = useRef(null)
  const desktopSearchRef = useRef(null)

  const menuId = useId()
  const searchPanelId = useId()
  const desktopSearchInputId = useId()
  const mobileSearchInputId = useId()

  // Thin border once the page leaves the very top.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes the overlays.
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    document.body.classList.add('is-scroll-locked')

    return () => document.body.classList.remove('is-scroll-locked')
  }, [isMenuOpen])

  // Escape closes whichever overlay is open and returns focus to its trigger.
  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return

      if (isMenuOpen) {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }

      if (isSearchOpen) {
        setIsSearchOpen(false)
        searchButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen, isSearchOpen])

  useEffect(() => {
    if (isSearchOpen) desktopSearchRef.current?.focus()
  }, [isSearchOpen])

  /**
   * The open menu covers the page, so Tab is kept to the menu's own controls.
   * The cycle deliberately includes the toggle button — it stays visible above
   * the panel and doubles as the close control, so keyboard users must be able
   * to reach it. Focus opens on the first nav link, never the search field,
   * which would otherwise pop the on-screen keyboard on every tap.
   */
  useEffect(() => {
    const panel = menuPanelRef.current

    if (!isMenuOpen || !panel) return undefined

    panel.querySelector('a[href]')?.focus()

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return

      const cycle = [menuButtonRef.current, ...panel.querySelectorAll(FOCUSABLE)]
        .filter(Boolean)

      if (cycle.length === 0) return

      const index = cycle.indexOf(document.activeElement)
      const step = event.shiftKey ? -1 : 1
      const next = cycle[(index + step + cycle.length) % cycle.length]

      // Outside the cycle entirely (e.g. focus fell into the page behind)
      if (index === -1) {
        event.preventDefault()
        cycle[0].focus()
        return
      }

      event.preventDefault()
      next.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const trimmed = query.trim()

    navigate(
      trimmed ? `${paths.shop}?q=${encodeURIComponent(trimmed)}` : paths.shop,
    )
  }

  const handleQueryChange = (event) => setQuery(event.target.value)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={`header${isScrolled ? ' header--scrolled' : ''}`}>
      <Container className="header__bar">
        <Brand />

        <nav className="header__nav" aria-label="Main">
          <ul className="header__nav-list">
            {primaryNav.map((item) => (
              <li key={item.id}>
                <Link className="header__nav-link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button
            type="button"
            ref={searchButtonRef}
            className="header__icon-button header__icon-button--desktop"
            aria-expanded={isSearchOpen}
            aria-controls={searchPanelId}
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <Icon name={isSearchOpen ? 'close' : 'search'} size={20} />
            <span className="sr-only">
              {isSearchOpen ? 'Close search' : 'Search gifts'}
            </span>
          </button>

          <Link to={paths.cart} className="header__icon-button">
            <Icon name="bag" size={20} />
            <span className="sr-only">Cart</span>
          </Link>

          <Button to={paths.shop} size="sm" className="header__cta">
            Create Your Gift
          </Button>

          <button
            type="button"
            ref={menuButtonRef}
            className="header__icon-button header__icon-button--menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} size={22} />
            <span className="sr-only">
              {isMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
          </button>
        </div>
      </Container>

      <div
        id={searchPanelId}
        className="header__search-panel"
        hidden={!isSearchOpen}
      >
        <Container>
          <SearchForm
            id={desktopSearchInputId}
            inputRef={desktopSearchRef}
            value={query}
            onChange={handleQueryChange}
            onSubmit={handleSearchSubmit}
          />
        </Container>
      </div>

      <div
        id={menuId}
        ref={menuPanelRef}
        className="header__mobile-menu"
        hidden={!isMenuOpen}
        tabIndex={-1}
        aria-label="Menu"
      >
        <Container className="header__mobile-inner">
          <nav aria-label="Mobile">
            <ul className="header__mobile-list">
              {primaryNav.map((item) => (
                <li key={item.id}>
                  <Link
                    className="header__mobile-link"
                    to={item.to}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <SearchForm
            id={mobileSearchInputId}
            value={query}
            onChange={handleQueryChange}
            onSubmit={handleSearchSubmit}
          />

          <Button
            to={paths.shop}
            size="lg"
            className="btn--block"
            trailingIcon="arrowRight"
            onClick={closeMenu}
          >
            Create Your Gift
          </Button>

          <p className="header__mobile-note">More than a gift, a memory.</p>
        </Container>
      </div>
    </header>
  )
}

export default Header
