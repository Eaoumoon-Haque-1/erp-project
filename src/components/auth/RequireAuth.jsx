/**
 * @file Route guard that keeps unauthenticated users outside the ERP shell.
 * The requested URL is retained so a successful login can return there.
 */
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../auth/useAuth'

function RequireAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={'/login'} replace state={{ from: location }} />
  }

  return children
}

export default RequireAuth
