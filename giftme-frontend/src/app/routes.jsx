import { Route, Routes } from 'react-router-dom'
import RootLayout from '../components/layout/RootLayout.jsx'
import HomePage from '../pages/Home/HomePage.jsx'
import NotFoundPage from '../pages/NotFound/NotFoundPage.jsx'
import { paths } from './paths.js'

/**
 * Route table.
 *
 * Only the home page is implemented. Future pages plug in as siblings of the
 * `paths.home` route (shop, product, cart, checkout, tracking, the public
 * `/m/:publicCode` memory page) — the admin area will get its own layout route
 * next to <RootLayout /> so it does not inherit the storefront header/footer.
 * Everything unrouted falls through to <NotFoundPage />.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
