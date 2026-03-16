/**
 * Roles management types matching backend DTOs
 */

export type RoleTypeDto = 'CONSUMER' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE' | 'SUPER_ADMIN'

export type RoleStatus = 'ACTIVE' | 'INACTIVE'

/** Matches backend AdminRoleDto */
export interface AdminRoleDto {
  id: number
  roleName: string
  roleType: RoleTypeDto
  status: RoleStatus
  permissions: string[] // "FEATURE.ACTION" format
  createdOn: string
  updatedOn: string
}

/** Matches backend CreateRoleRequest */
export interface CreateRoleRequest {
  roleName: string
  roleType: RoleTypeDto
  permissions: string[]
}

/** Matches backend UpdateRoleRequest */
export interface UpdateRoleRequest {
  roleName: string
  permissions: string[]
}

/** Matches backend FeaturePermissionsDto */
export interface FeaturePermissionsDto {
  feature: string
  permissions: string[]
}

