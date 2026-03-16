import StorageService from './storage_service'
import type { AdminUser } from '../entities/admin_user'
import type { AuthResponse } from '../../features/auth/api/auth_types'
import type { AdminProfileResponse } from '../../features/profile/api/profile_types'
import { getDeviceId } from '../utils/device_utils'
import { API_URL } from '../configs/env'

/**
 * Transforms backend AuthResponse to AdminUser entity for storage
 */
function mapAuthResponseToUser(response: AuthResponse): AdminUser {
  return {
    id: String(response.userId),
    name: 'Admin User', // Backend doesn't return name in login response
    email: '', // Backend doesn't return email in login response
    roleId: response.role,
    roleName: response.role,
    roleType: response.role,
    permissionsMap: response.permissions,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const AuthService = {
  /**
   * Stores the authentication session after successful login.
   * Called after RTK Query login mutation succeeds.
   */
  storeSession(authResponse: AuthResponse): void {
    StorageService.setAccessToken(authResponse.accessToken)
    StorageService.setRefreshToken(authResponse.refreshToken)
    const user = mapAuthResponseToUser(authResponse)
    StorageService.setUser(user)
  },

  /**
   * Updates stored user data with profile information.
   * Called after fetching profile to get complete user details.
   */
  updateUserFromProfile(profile: AdminProfileResponse): void {
    const existingUser = StorageService.getUser()
    if (existingUser) {
      const updatedUser: AdminUser = {
        ...existingUser,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl ?? undefined,
        isActive: profile.status === 'ACTIVE',
      }
      StorageService.setUser(updatedUser)
    }
  },

  /**
   * Gets logout credentials for API call
   */
  getLogoutCredentials(): { refreshToken: string; deviceId: string } | null {
    const refreshToken = StorageService.getRefreshToken()
    const deviceId = getDeviceId()
    if (!refreshToken) return null
    return { refreshToken, deviceId }
  },

  /**
   * Refreshes the access token using the stored refresh token.
   * Calls the backend /auth/refresh endpoint.
   */
  async refresh(): Promise<string> {
    const refreshToken = StorageService.getRefreshToken()
    const deviceId = getDeviceId()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        deviceId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const result = await response.json()
    const authResponse: AuthResponse = result.data

    // Store the new tokens
    StorageService.setAccessToken(authResponse.accessToken)
    StorageService.setRefreshToken(authResponse.refreshToken)

    return authResponse.accessToken
  },

  logout(): void {
    StorageService.clearAll()
  },

  isAuthenticated(): boolean {
    return StorageService.getAccessToken() !== null
  },
}

export default AuthService
