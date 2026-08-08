import { Navigate, Route, Routes } from 'react-router-dom'
import './styles/admin.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import { RequireAuth } from './auth/RequireAuth.jsx'
import { AdminLayout } from './components/layout/AdminLayout.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ProductsPage } from './pages/ProductsPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { OrderDetailPage } from './pages/OrderDetailPage.jsx'
import { TrackingPage } from './pages/TrackingPage.jsx'
import { CustomersPage } from './pages/CustomersPage.jsx'
import { MemoriesPage } from './pages/MemoriesPage.jsx'
import { paths } from '../app/paths.js'

/**
 * Everything under /admin/*, mounted as a sibling of <RootLayout /> in the top-level
 * route table so it never inherits the storefront's header/footer (see routes.jsx).
 * Owns its own CSS (./styles/admin.css) and auth state (<AuthProvider>) - self-contained
 * on purpose, so it can eventually be extracted or deployed separately with no rewiring.
 */
export function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          {/* The dashboard's canonical URL is bare /admin (index route above), matching
              paths.admin.dashboard - but every other section follows /admin/{section}, so
              /admin/dashboard is an entirely reasonable URL to type or bookmark. Redirect
              it rather than let it 404/blank-page. */}
          <Route path="dashboard" element={<Navigate to={paths.admin.dashboard} replace />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="memories" element={<MemoriesPage />} />
          {/* Any other unmatched path under an authenticated /admin/* session: back to the
              dashboard instead of silently rendering nothing (this is the actual bug that
              made /admin/dashboard render a blank white page before this fix). */}
          <Route path="*" element={<Navigate to={paths.admin.dashboard} replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
