/**
 * User management types matching backend DTOs
 */

export type UserStatusDto = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL'
export type RoleTypeDto = 'CONSUMER' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE' | 'SUPER_ADMIN'

/** Matches backend AdminUserDto */
export interface AdminUserDto {
  id: number
  username: string | null
  name: string
  email: string
  mobileNumber: string
  avatarUrl: string | null
  status: UserStatusDto
  roleId: number
  roleName: string | null
  roleType: RoleTypeDto | null
  createdOn: string
  updatedOn: string
}

/** Matches backend CreateAdminUserRequest */
export interface CreateAdminUserRequest {
  username: string
  name: string
  email: string
  mobileNumber: string
  password: string
  roleId: number
}

/** Payload for creating user with optional avatar file */
export interface CreateUserPayload {
  data: CreateAdminUserRequest
  avatar?: File
}

/** Matches backend UpdateUserRequest */
export interface AdminUpdateUserRequest {
  username?: string
  name?: string
  email?: string
  mobileNumber?: string
  roleId?: number
}

/** Payload for updating user with optional avatar file */
export interface UpdateUserPayload {
  userId: number
  data: AdminUpdateUserRequest
  avatar?: File
}

/** Query params for listing users */
export interface ListUsersParams {
  status?: string
  search?: string
  page?: number
  size?: number
}

/** Spring Data Page response format */
export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
}
