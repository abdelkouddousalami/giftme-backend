import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { paths } from '../../app/paths.js'

/** Guards every /admin route: unauthenticated users never see admin UI, per frontend rule #15. */
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={paths.admin.login} replace state={{ from: location }} />
  }

  return children
}
