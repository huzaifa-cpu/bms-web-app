import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import RbacService from './rbac_service'
import StorageService from './storage_service'
import type { AdminUser } from '../entities/admin_user'

const makeUser = (permissionsMap: Record<string, string[]>): AdminUser => ({
  id: '1',
  name: 'Test Admin',
  email: 'admin@test.com',
  roleId: 'role-1',
  roleName: 'Admin',
  permissionsMap,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('RbacService', () => {
  beforeEach(() => {
    StorageService.clearAll()
  })

  afterEach(() => {
    StorageService.clearAll()
    vi.restoreAllMocks()
  })

  describe('isAuthenticated', () => {
    it('returns false when no access token is stored', () => {
      expect(RbacService.isAuthenticated()).toBe(false)
    })

    it('returns true when an access token is stored', () => {
      StorageService.setAccessToken('mock-token')
      expect(RbacService.isAuthenticated()).toBe(true)
    })
  })

  describe('can', () => {
    it('returns false when no user is stored', () => {
      expect(RbacService.can('BOOKINGS', 'VIEW')).toBe(false)
    })

    it('returns true when user has the permission', () => {
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'], DISPUTES: ['VIEW'] }))
      expect(RbacService.can('BOOKINGS', 'VIEW')).toBe(true)
    })

    it('returns false when user does not have the permission', () => {
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'] }))
      expect(RbacService.can('DISPUTES', 'VIEW')).toBe(false)
    })

    it('returns false when user has the feature but not the action', () => {
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'] }))
      expect(RbacService.can('BOOKINGS', 'CREATE')).toBe(false)
    })

    it('returns false when user has an empty permissions map', () => {
      StorageService.setUser(makeUser({}))
      expect(RbacService.can('BOOKINGS', 'VIEW')).toBe(false)
    })
  })

  describe('canAny', () => {
    it('returns false when no user is stored', () => {
      expect(RbacService.canAny([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(false)
    })

    it('returns true when user has at least one of the permissions', () => {
      StorageService.setUser(makeUser({ DISPUTES: ['VIEW'] }))
      expect(RbacService.canAny([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(true)
    })

    it('returns false when user has none of the permissions', () => {
      StorageService.setUser(makeUser({ SETTLEMENTS: ['VIEW'] }))
      expect(RbacService.canAny([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns false when no user is stored', () => {
      expect(RbacService.canAll([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(false)
    })

    it('returns true when user has all required permissions', () => {
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'], DISPUTES: ['VIEW'], SETTLEMENTS: ['VIEW'] }))
      expect(RbacService.canAll([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(true)
    })

    it('returns false when user is missing at least one permission', () => {
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'] }))
      expect(RbacService.canAll([['BOOKINGS', 'VIEW'], ['DISPUTES', 'VIEW']])).toBe(false)
    })

    it('returns true when required permissions array is empty (vacuously true)', () => {
      StorageService.setUser(makeUser({}))
      expect(RbacService.canAll([])).toBe(true)
    })
  })
})
