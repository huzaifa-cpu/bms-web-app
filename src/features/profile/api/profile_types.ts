/**
 * User status enum matching backend UserStatus.java
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL'

/**
 * Admin profile response matching backend AdminProfileResponse.java
 */
export interface AdminProfileResponse {
  id: number
  name: string
  email: string
  username: string
  mobileNumber: string | null
  avatarUrl: string | null
  role: string
  status: UserStatus
  lastLoginAt: string | null
}

/**
 * Update profile request matching backend UpdateAdminProfileRequest.java
 */
export interface UpdateAdminProfileRequest {
  username?: string
  name?: string
  email?: string
  mobileNumber?: string
}

/**
 * Update profile with optional avatar file
 */
export interface UpdateProfilePayload {
  data: UpdateAdminProfileRequest
  avatar?: File
}

/**
 * Change password request matching backend ChangePasswordRequest.java
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

