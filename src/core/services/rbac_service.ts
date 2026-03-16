import StorageService from './storage_service'

const RbacService = {
  /**
   * Check if user has permission for a specific feature and action.
   * Uses the raw permissions map stored from login response.
   * @example RbacService.can('USERS', 'VIEW')
   * @example RbacService.can('APPROVALS_PROVIDERS', 'APPROVE')
   */
  can(feature: string, action: string): boolean {
    const user = StorageService.getUser()
    if (!user || !user.permissionsMap) return false
    const actions = user.permissionsMap[feature]
    return actions?.includes(action) ?? false
  },

  /**
   * Check if user has any of the specified feature-action pairs.
   * @example RbacService.canAny([['USERS', 'VIEW'], ['ROLES', 'VIEW']])
   */
  canAny(permissions: [string, string][]): boolean {
    return permissions.some(([feature, action]) => this.can(feature, action))
  },

  /**
   * Check if user has all of the specified feature-action pairs.
   * @example RbacService.canAll([['USERS', 'VIEW'], ['USERS', 'CREATE']])
   */
  canAll(permissions: [string, string][]): boolean {
    return permissions.every(([feature, action]) => this.can(feature, action))
  },

  isAuthenticated(): boolean {
    return StorageService.getAccessToken() !== null
  },
}

export default RbacService
