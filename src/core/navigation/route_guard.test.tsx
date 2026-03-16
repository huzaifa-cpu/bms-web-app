import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RouteGuard } from './route_guard'
import StorageService from '../services/storage_service'
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

function renderGuard(
  initialPath: string,
  requiredPermission?: [string, string],
  requiredPermissions?: [string, string][],
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/not-authorized" element={<div>Not Authorized Page</div>} />
        <Route
          element={
            <RouteGuard
              requiredPermission={requiredPermission}
              requiredPermissions={requiredPermissions}
            />
          }
        >
          <Route path="/protected" element={<div>Protected Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RouteGuard', () => {
  beforeEach(() => {
    StorageService.clearAll()
  })

  afterEach(() => {
    StorageService.clearAll()
  })

  describe('unauthenticated user', () => {
    it('redirects to /login when no access token is present', () => {
      renderGuard('/protected')
      expect(screen.getByText('Login Page')).toBeDefined()
    })

    it('does not render the protected page', () => {
      renderGuard('/protected')
      expect(screen.queryByText('Protected Page')).toBeNull()
    })
  })

  describe('authenticated user without required permission', () => {
    it('redirects to /not-authorized when user lacks the required permission', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'] }))
      renderGuard('/protected', ['DISPUTES', 'VIEW'])
      expect(screen.getByText('Not Authorized Page')).toBeDefined()
    })

    it('does not render the protected page', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({ BOOKINGS: ['VIEW'] }))
      renderGuard('/protected', ['DISPUTES', 'VIEW'])
      expect(screen.queryByText('Protected Page')).toBeNull()
    })
  })

  describe('authenticated user with required permission', () => {
    it('renders the protected outlet when user has the required permission', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({ DISPUTES: ['VIEW'], BOOKINGS: ['VIEW'] }))
      renderGuard('/protected', ['DISPUTES', 'VIEW'])
      expect(screen.getByText('Protected Page')).toBeDefined()
    })
  })

  describe('authenticated user with no permission requirement', () => {
    it('renders the protected outlet when no permissions are required', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({}))
      renderGuard('/protected')
      expect(screen.getByText('Protected Page')).toBeDefined()
    })
  })

  describe('authenticated user with all required permissions', () => {
    it('renders the protected outlet when user has all required permissions', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({ DISPUTES: ['VIEW', 'CLOSE'], BOOKINGS: ['VIEW'] }))
      renderGuard('/protected', undefined, [['DISPUTES', 'VIEW'], ['DISPUTES', 'CLOSE']])
      expect(screen.getByText('Protected Page')).toBeDefined()
    })

    it('redirects to /not-authorized when user has only some of the required permissions', () => {
      StorageService.setAccessToken('mock-token')
      StorageService.setUser(makeUser({ DISPUTES: ['VIEW'] }))
      renderGuard('/protected', undefined, [['DISPUTES', 'VIEW'], ['DISPUTES', 'CLOSE']])
      expect(screen.getByText('Not Authorized Page')).toBeDefined()
    })
  })
})
