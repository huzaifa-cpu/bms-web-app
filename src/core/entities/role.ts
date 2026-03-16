export interface Role {
  id: string
  name: string
  description?: string
  roleType?: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE'
  permissions: string[]
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}
