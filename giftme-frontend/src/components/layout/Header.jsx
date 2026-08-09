import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import BrandLogo from '../common/BrandLogo.jsx'
import { primaryNav } from '../../data/navigation.js'
import { paths } from '../../app/paths.js'
import { useCart } from '../../store/CartContext.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { SUPPORTED_LANGUAGES } from '../../i18n/index.js'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** primaryNav carries no label of its own (see data/navigation.js) - each id
 * maps to a `nav.*` translation key here instead. */
const NAV_LABEL_KEYS = {
  shop: 'nav.shop',
  personalized: 'nav.personalized',
  'how-it-works': 'nav.howItWorks',
  story: 'nav.story',
}

const THEME_SEQUENCE = ['system', 'light', 'dark']
const THEME_ICONS = { system: 'globe', light: 'sun', dark: 'moon' }

/**
 * Quiet 40px target: no chrome at rest, a warm sand well on hover.
 *
 * It deliberately does NOT set `display`. Two Tailwind entry points share this
 * bundle, which puts brand-breakpoint utilities (`nav:`, `wide:`) EARLIER in
 * the stylesheet than unvariated ones — so a bare `inline-flex` here would beat
 * the menu button's `nav:hidden` and leave a hamburger on the desktop header.
 * Every call site states its own display, in ranges that cannot overlap.
 */
const ICON_BUTTON =
  'h-10 w-10 items-center justify-center rounded-(--radius-sm) text-ink transition-colors duration-200 hover:bg-sand'

/** Shared by the desktop drawer and the mobile menu — declared once. */
function SearchForm({ id, inputRef, value, onChange, onSubmit }) {
  const { t } = useTranslation()
  return (
    <form
      className="m-0 flex items-center gap-3 rounded-(--radius-sm) border border-line-input bg-white ps-4 pe-1.5 py-1.5 transition-colors duration-200 focus-within:border-ink"
      role="search"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor={id}>
        {t('header.searchLabel')}
      </label>
      <Icon name="search" size={18} className="shrink-0 text-ink-soft" />
      <input
        id={id}
        ref={inputRef}
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft"
        type="search"
        placeholder={t('header.searchPlaceholder')}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      <button
        type="submit"
        className="shrink-0 rounded-(--radius-xs) bg-ink px-4 py-2 text-xs font-medium tracking-[0.06em] text-paper uppercase transition-colors duration-200 hover:bg-graphite"
      >
        {t('header.search')}
      </button>
    </form>
  )
}

/** Small popover: current language as a two-letter mark, three choices inside. */
function LanguageSwitcher({ variant = 'desktop' }) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const current = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage) ?? SUPPORTED_LANGUAGES[0]

  function choose(code) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2">
        <span className="sr-only">{t('header.language')}</span>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => choose(lang.code)}
            aria-pressed={lang.code === current.code}
            className={`rounded-(--radius-pill) border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
              lang.code === current.code
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative max-nav:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t('header.language')}
        className={`inline-flex gap-1.5 px-2.5 ${ICON_BUTTON}`}
      >
        <Icon name="globe" size={18} />
        <span className="text-[0.6875rem] font-medium tracking-[0.06em] uppercase">{current.code}</span>
      </button>

      {open ? (
        <ul
          role="menu"
          className="absolute end-0 top-full z-(--z-overlay) mt-2 min-w-[9rem] rounded-(--radius-sm) border border-line-strong bg-white py-1.5 shadow-(--shadow-md)"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={lang.code === current.code}
                onClick={() => choose(lang.code)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-start text-sm transition-colors duration-200 hover:bg-bone ${
                  lang.code === current.code ? 'text-ink font-medium' : 'text-ink-soft'
                }`}
              >
                {lang.label}
                {lang.code === current.code ? <Icon name="check" size={14} /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Cycles system -> light -> dark -> system on each press; the icon and the
 * accessible label always name the mode currently in effect. */
function ThemeToggle({ variant = 'desktop' }) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  function cycle() {
    const next = THEME_SEQUENCE[(THEME_SEQUENCE.indexOf(theme) + 1) % THEME_SEQUENCE.length]
    setTheme(next)
  }

  const label = t('header.theme') + ': ' + t(`header.${theme}Mode`)

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={cycle}
        className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-line-strong px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-colors duration-200 hover:border-ink hover:text-ink"
      >
        <Icon name={THEME_ICONS[theme]} size={15} strokeWidth={1.4} />
        {t(`header.${theme}Mode`)}
      </button>
    )
  }

  return (
    <span className="max-nav:hidden">
      <button
        type="button"
        onClick={cycle}
        title={label}
        aria-label={label}
        className={`inline-flex ${ICON_BUTTON}`}
      >
        <Icon name={THEME_ICONS[theme]} size={19} />
      </button>
    </span>
  )
}

/**
 * The storefront masthead.
 *
 * Three zones from `nav` up (992px): the mark, four navigation items, and the
 * shopper's own controls — search, account, bag. That breakpoint is measured
 * rather than inherited: four labels plus three targets plus a call to action
 * do not fit in the old 900px composition without crowding, and crowding is
 * the one thing a premium masthead cannot do. For the same reason the CTA
 * itself only appears at `wide` (1200px), where there is room for it to sit
 * apart rather than jostle the bag.
 *
 * At rest the header is a translucent veil over the hero with no bottom edge,
 * so the announcement bar, the header and the hero read as one field. It grows
 * a hairline and a more opaque ground the moment the page leaves the top.
 */
function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuTop, setMenuTop] = useState(null)
  const [query, setQuery] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  /** Signed-out shoppers get the sign-in screen; the account page is behind auth. */
  const accountTo = isAuthenticated ? paths.account : paths.login

  const cartLabel =
    itemCount > 0 ? t('header.cartItems', { count: itemCount }) : t('header.cartEmpty')

  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const searchButtonRef = useRef(null)
  const menuPanelRef = useRef(null)
  const desktopSearchRef = useRef(null)

  const menuId = useId()
  const searchPanelId = useId()
  const desktopSearchInputId = useId()
  const mobileSearchInputId = useId()

  /**
   * The menu is a fixed overlay, so it needs to start where the header ends —
   * and that is not a constant: at the top of the page the announcement bar is
   * still above the header, once scrolled it is not. Measured rather than
   * assumed.
   */
  const measureMenuTop = useCallback(() => {
    const bottom = headerRef.current?.getBoundingClientRect().bottom

    if (typeof bottom === 'number') setMenuTop(Math.round(bottom))
  }, [])

  // Thin border and a more opaque veil once the page leaves the very top.
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
    window.addEventListener('resize', measureMenuTop)

    return () => {
      document.body.classList.remove('is-scroll-locked')
      window.removeEventListener('resize', measureMenuTop)
    }
  }, [isMenuOpen, measureMenuTop])

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

      const cycle = [
        menuButtonRef.current,
        ...panel.querySelectorAll(FOCUSABLE),
      ].filter(Boolean)

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

    // `search`, not `q`: the shop page mirrors its URL state onto the backend's
    // own query parameter names (GET /api/products?search=…), so a shared or
    // hand-edited URL and a header search produce the same request.
    navigate(
      trimmed ? `${paths.shop}?search=${encodeURIComponent(trimmed)}` : paths.shop,
    )
  }

  const handleQueryChange = (event) => setQuery(event.target.value)
  const closeMenu = () => setIsMenuOpen(false)

  const toggleMenu = () => {
    setIsMenuOpen((open) => {
      if (!open) measureMenuTop()

      return !open
    })
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-(--z-header) border-b backdrop-blur-[16px] backdrop-saturate-150 transition-[background-color,border-color] duration-300 ${
          isScrolled
            ? 'border-line bg-(--color-bg-veil-strong)'
            : 'border-transparent bg-(--color-bg-veil)'
        }`}
      >
        <Container className="min-h-(--header-height) items-center justify-between max-nav:flex max-nav:gap-5 nav:grid nav:grid-cols-[1fr_auto_1fr] nav:gap-8">
          <div className="flex items-center">
            <BrandLogo />
          </div>

          <nav className="max-nav:hidden" aria-label="Main">
            <ul className="flex items-center max-wide:gap-7 wide:gap-9">
              {primaryNav.map((item) => (
                <li key={item.id}>
                  <Link
                    className="group relative inline-block py-2 text-[0.875rem] text-ink transition-colors duration-200 hover:text-burgundy"
                    to={item.to}
                  >
                    {t(NAV_LABEL_KEYS[item.id])}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0.5 block h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-brand group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-0.5">
            <span className="max-nav:hidden">
              <button
                type="button"
                ref={searchButtonRef}
                className={`inline-flex ${ICON_BUTTON}`}
                aria-expanded={isSearchOpen}
                aria-controls={searchPanelId}
                onClick={() => setIsSearchOpen((open) => !open)}
              >
                <Icon name={isSearchOpen ? 'close' : 'search'} size={19} />
                <span className="sr-only">
                  {isSearchOpen ? t('header.closeSearch') : t('header.searchLabel')}
                </span>
              </button>
            </span>

            <LanguageSwitcher />
            <ThemeToggle />

            <span className="max-nav:hidden">
              <Link to={accountTo} className={`inline-flex ${ICON_BUTTON}`}>
                <Icon name="user" size={19} />
                <span className="sr-only">
                  {isAuthenticated ? t('header.yourAccount') : t('header.signIn')}
                </span>
              </Link>
            </span>

            <Link to={paths.cart} className={`relative inline-flex ${ICON_BUTTON}`}>
              <Icon name="bag" size={19} />
              {/* The count is announced through the link's own label rather than
                  as loose text, so a screen reader hears "Cart, 2 items" in one
                  go instead of a stray numeral. */}
              {itemCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1 end-1 flex min-w-4 items-center justify-center rounded-(--radius-pill) bg-burgundy px-1 text-[0.5625rem] leading-4 font-semibold text-paper"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              ) : null}
              <span className="sr-only">{cartLabel}</span>
            </Link>

            <span
              aria-hidden="true"
              className="mx-3 h-5 w-px bg-line-strong max-wide:hidden wide:block"
            />

            <div className="max-wide:hidden">
              <Button to={paths.shop} variant="outline" size="sm">
                {t('header.createYourGift')}
              </Button>
            </div>

            <button
              type="button"
              ref={menuButtonRef}
              className={`${ICON_BUTTON} max-nav:inline-flex nav:hidden`}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              onClick={toggleMenu}
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} size={22} />
              <span className="sr-only">
                {isMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
              </span>
            </button>
          </div>
        </Container>

        <div
          id={searchPanelId}
          className="animate-drawer border-t border-line bg-ivory py-4"
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
      </header>

      {/* Outside <header> on purpose: the header's backdrop-filter makes it a
          containing block for fixed positioning, which would pin this overlay
          to the header's own box instead of the viewport. */}
      <div
        id={menuId}
        ref={menuPanelRef}
        className="animate-fade fixed inset-x-0 bottom-0 z-(--z-overlay) overflow-y-auto border-t border-line bg-ivory outline-none nav:hidden"
        style={{ top: menuTop ?? 'var(--header-height)' }}
        hidden={!isMenuOpen}
        tabIndex={-1}
        aria-label="Menu"
      >
        <Container className="flex flex-col gap-6 pt-6 pb-16">
          <nav aria-label="Mobile">
            <ul className="flex flex-col border-t border-line">
              {primaryNav.map((item, index) => (
                <li key={item.id}>
                  <Link
                    className="flex items-center gap-3 border-b border-line py-3.5 text-[1.0625rem] font-medium transition-colors duration-200 hover:text-burgundy"
                    to={item.to}
                    onClick={closeMenu}
                  >
                    <span className="text-[0.625rem] tracking-[0.1em] text-clay-deep tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {t(NAV_LABEL_KEYS[item.id])}
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
            {t('header.createYourGift')}
          </Button>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-line pt-6">
            <LanguageSwitcher variant="mobile" />
            <ThemeToggle variant="mobile" />
          </div>

          <ul className="flex flex-col gap-4 border-t border-line pt-6 text-[0.875rem] text-ink-soft">
            <li>
              <Link
                to={accountTo}
                onClick={closeMenu}
                className="inline-flex items-center gap-3 transition-colors duration-200 hover:text-ink"
              >
                <Icon name="user" size={17} strokeWidth={1.4} />
                {isAuthenticated ? t('header.yourAccount') : t('header.signIn')}
              </Link>
            </li>
            <li>
              <Link
                to={paths.track}
                onClick={closeMenu}
                className="inline-flex items-center gap-3 transition-colors duration-200 hover:text-ink"
              >
                <Icon name="truck" size={17} strokeWidth={1.4} />
                {t('header.trackOrder')}
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </>
  )
}

export default Header
