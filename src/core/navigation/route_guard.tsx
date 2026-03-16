import { Navigate, Outlet } from 'react-router-dom'
import RbacService from '../services/rbac_service'
import { ROUTES } from '../constants/routes'

interface RouteGuardProps {
  /** Required permission as [feature, action] tuple (e.g., ['USERS', 'VIEW']) */
  requiredPermission?: [string, string]
  /** Multiple required permissions - user must have ALL */
  requiredPermissions?: [string, string][]
}

export function RouteGuard({ requiredPermission, requiredPermissions }: RouteGuardProps) {
  if (!RbacService.isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check single permission
  if (requiredPermission) {
    const hasAccess = RbacService.can(requiredPermission[0], requiredPermission[1])
    if (!hasAccess) {
      return <Navigate to={ROUTES.NOT_AUTHORIZED} replace />
    }
  }

  // Check multiple permissions (must have ALL)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = RbacService.canAll(requiredPermissions)
    if (!hasAccess) {
      return <Navigate to={ROUTES.NOT_AUTHORIZED} replace />
    }
  }

  return <Outlet />
}
