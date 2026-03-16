export interface AdminUser {
  id: string
  name: string
  email: string
  roleId: string
  roleName?: string
  roleType?: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE'
  /** Raw permissions map from backend: { "USERS": ["VIEW", "CREATE"], "BOOKINGS": ["VIEW"] } */
  permissionsMap: Record<string, string[]>
  isActive: boolean
  createdAt: string
  updatedAt: string
  avatarUrl?: string
}
