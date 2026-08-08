import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import useRouteScroll from '../../hooks/useRouteScroll.js'

/** Storefront shell: skip link, header, routed page, footer. */
function RootLayout() {
  useRouteScroll()

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Header />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

export default RootLayout
