import { Route, Routes } from 'react-router-dom'
import RootLayout from '../components/layout/RootLayout.jsx'
import HomePage from '../pages/Home/HomePage.jsx'
import PublicMemoryPage from '../pages/Memory/PublicMemoryPage.jsx'
import NotFoundPage from '../pages/NotFound/NotFoundPage.jsx'
import { AdminRoutes } from '../admin/AdminRoutes.jsx'
import { paths } from './paths.js'

/**
 * Route table.
 *
 * Home and the public QR memory page (`/m/:publicCode`) are implemented on the
 * storefront side. Future pages plug in as siblings of the `paths.home` route
 * (shop, product, cart, checkout, tracking).
 *
 * The admin area (/admin/*) is a sibling of <RootLayout />, not nested inside
 * it, so it never inherits the storefront header/footer - it owns its own
 * layout, auth and stylesheet (see src/admin/AdminRoutes.jsx).
 *
 * Everything else unrouted falls through to <NotFoundPage />.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route element={<RootLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path="m/:publicCode" element={<PublicMemoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
