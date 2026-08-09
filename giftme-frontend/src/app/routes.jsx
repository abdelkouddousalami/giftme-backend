import { Route, Routes } from 'react-router-dom'
import RootLayout from '../components/layout/RootLayout.jsx'
import HomePage from '../pages/Home/HomePage.jsx'
import ShopPage from '../pages/Shop/ShopPage.jsx'
import ProductPage from '../pages/Product/ProductPage.jsx'
import CartPage from '../pages/Cart/CartPage.jsx'
import CheckoutPage from '../pages/Checkout/CheckoutPage.jsx'
import OrderConfirmedPage from '../pages/Checkout/OrderConfirmedPage.jsx'
import TrackPage from '../pages/Track/TrackPage.jsx'
import LoginPage from '../pages/Auth/LoginPage.jsx'
import RegisterPage from '../pages/Auth/RegisterPage.jsx'
import AccountPage from '../pages/Account/AccountPage.jsx'
import PublicMemoryPage from '../pages/Memory/PublicMemoryPage.jsx'
import NotFoundPage from '../pages/NotFound/NotFoundPage.jsx'
import RequireAuth from '../auth/RequireAuth.jsx'
import { AdminRoutes } from '../admin/AdminRoutes.jsx'
import { paths } from '../app/paths.js'

/**
 * Route table.
 *
 * The admin area (/admin/*) is a sibling of <RootLayout />, not nested inside
 * it, so it never inherits the storefront header/footer — it owns its own
 * layout, auth and stylesheet (see src/admin/AdminRoutes.jsx).
 *
 * Only /account sits behind <RequireAuth />. Everything else on the storefront
 * is deliberately reachable signed out, including the whole checkout: the
 * backend treats guest cash-on-delivery as a first-class flow, and gating any
 * of it behind an account would be the frontend inventing a rule the API does
 * not have.
 *
 * The editorial routes declared in paths.js (about, contact, shipping, privacy,
 * terms) are intentionally absent — they are static copy with no backend behind
 * them, so they fall through to <NotFoundPage /> until someone writes them.
 *
 * `/order-confirmed` reads its order from router state rather than the URL,
 * because there is no customer-facing endpoint to re-fetch an order by id; the
 * page handles a direct visit by offering order tracking instead.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route element={<RootLayout />}>
        <Route path={paths.home} element={<HomePage />} />

        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:slug" element={<ProductPage />} />

        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmed" element={<OrderConfirmedPage />} />
        <Route path="track" element={<TrackPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountPage />} />
        </Route>

        <Route path="m/:publicCode" element={<PublicMemoryPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
