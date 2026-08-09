import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Container from '../components/common/Container.jsx'
import { LoadingBlock } from '../components/ui/Spinner.jsx'
import { useAuth } from './AuthContext.jsx'
import { paths } from '../app/paths.js'

/**
 * Route guard for the (very small) signed-in area of the storefront.
 *
 * Three outcomes, and the middle one matters most: while `initializing` is true
 * the session is still being revalidated against `GET /api/auth/me`, and
 * redirecting during that window would bounce a perfectly valid returning
 * visitor to the login page on every hard refresh.
 *
 * The intercepted location travels to /login in router state so the user lands
 * back where they were aiming rather than on a generic account screen.
 *
 * Nothing here is a security boundary — the backend authorizes every request on
 * its own. This only decides what is worth rendering.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <section className="py-(--section-y)">
        <Container size="narrow">
          <LoadingBlock label="Checking your session" />
        </Container>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />
  }

  // Usable as a layout route (<Outlet />) or as a wrapper around one element.
  return children ?? <Outlet />
}

export default RequireAuth
