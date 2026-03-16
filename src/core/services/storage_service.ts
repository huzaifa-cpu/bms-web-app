import { STORAGE_KEYS } from '../constants/app_constants'
import type { AdminUser } from '../entities/admin_user'

const StorageService = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  },

  getUser(): AdminUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AdminUser
    } catch {
      return null
    }
  },

  setUser(user: AdminUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  },
}

export default StorageService
