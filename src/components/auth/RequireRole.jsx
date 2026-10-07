/**
 * @file Frontend route guard for role-restricted route branches.
 * Sections: allowed-role check and either child rendering or redirect/fallback behavior.
 * This improves UX only; backend endpoints must enforce authorization independently.
 */
import { Navigate } from 'react-router-dom'
import { currentUser } from '../../app/currentUser'

function RequireRole({ allowedRoles, children }) {
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={'/'} replace />
  }

  return children
}

export default RequireRole
