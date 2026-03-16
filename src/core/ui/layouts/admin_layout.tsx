import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Container, Dropdown, Spinner } from 'react-bootstrap'
import {
  BsSpeedometer2, BsPersonCheck, BsGeoAlt, BsBuildingGear,
  BsCalendarCheck, BsExclamationTriangle, BsCurrencyDollar,
  BsCreditCard2Back, BsBell, BsBarChart, BsPeople,
  BsPersonBadge, BsPerson, BsList, BsSun, BsMoon, BsGrid,
  BsController, BsGear, BsTrophy,
} from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../constants/routes'
import RbacService from '../../services/rbac_service'
import StorageService from '../../services/storage_service'
import AuthService from '../../services/auth_service'
import { ThemeService } from '../theme/theme_service'
import { useLogoutMutation } from '../../../features/auth/api/auth_api'
import { useGetProfileQuery } from '../../../features/profile/api/profile_api'
import logo from '../../../assets/logo.png'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  /** Permission check: [feature, action] - uses dynamic strings from backend */
  permission?: [string, string]
  end?: boolean
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <BsSpeedometer2 />, permission: ['DASHBOARD', 'VIEW'], end: true },
  {
    label: 'Management', to: '#', icon: <BsPeople />,
    children: [
      { label: 'Users', to: ROUTES.USERS, icon: <BsPeople />, permission: ['USERS', 'VIEW'] },
      { label: 'Roles', to: ROUTES.ROLES, icon: <BsPersonBadge />, permission: ['ROLES', 'VIEW'] },
      { label: 'Consumers', to: ROUTES.CONSUMERS, icon: <BsPeople />, permission: ['CONSUMERS', 'VIEW'] },
      { label: 'Providers', to: ROUTES.PROVIDERS, icon: <BsPersonBadge />, permission: ['PROVIDERS', 'VIEW'] },
      { label: 'Employees', to: ROUTES.EMPLOYEES, icon: <BsPeople />, permission: ['EMPLOYEES', 'VIEW'] },
      { label: 'Locations', to: ROUTES.LOCATIONS, icon: <BsGeoAlt />, permission: ['LOCATIONS', 'VIEW'] },
      { label: 'Facilities', to: ROUTES.FACILITIES, icon: <BsBuildingGear />, permission: ['FACILITIES', 'VIEW'] },
    ],
  },
  {
    label: 'Approvals', to: '#', icon: <BsPersonCheck />,
    children: [
      { label: 'Providers', to: ROUTES.APPROVALS_PROVIDERS, icon: <BsPersonBadge />, permission: ['APPROVALS_PROVIDERS', 'VIEW'] },
      { label: 'Locations', to: ROUTES.APPROVALS_LOCATIONS, icon: <BsGeoAlt />, permission: ['APPROVALS_LOCATIONS', 'VIEW'] },
      { label: 'Facilities', to: ROUTES.APPROVALS_FACILITIES, icon: <BsBuildingGear />, permission: ['APPROVALS_FACILITIES', 'VIEW'] },
    ],
  },
  {
    label: 'Socials', to: '#', icon: <BsController />,
    children: [
      { label: 'Teams', to: ROUTES.SOCIALS_TEAMS, icon: <BsPeople />, permission: ['TEAMS', 'VIEW'] },
      { label: 'Games', to: ROUTES.SOCIALS_GAMES, icon: <BsCalendarCheck />, permission: ['GAMES', 'VIEW'] },
      { label: 'Groups', to: ROUTES.SOCIALS_GROUPS, icon: <BsGrid />, permission: ['GROUPS', 'VIEW'] },
    ],
  },
  {
    label: 'Accounts', to: '#', icon: <BsCurrencyDollar />,
    children: [
      { label: 'Settlements', to: ROUTES.SETTLEMENTS, icon: <BsCreditCard2Back />, permission: ['SETTLEMENTS', 'VIEW'] },
    ],
  },
  {
    label: 'Subscriptions', to: '#', icon: <BsCreditCard2Back />,
    children: [
      { label: 'Plans', to: ROUTES.SUBSCRIPTION_PLANS, icon: <BsList />, permission: ['SUBSCRIPTIONS_PLANS', 'VIEW'] },
      { label: 'Requests', to: ROUTES.SUBSCRIPTION_REQUESTS, icon: <BsList />, permission: ['SUBSCRIPTIONS_REQUESTS', 'VIEW'] },
    ],
  },
  {
    label: 'Notifications', to: '#', icon: <BsBell />,
    children: [
      { label: 'Compose', to: ROUTES.NOTIFICATIONS_COMPOSE, icon: <BsBell />, permission: ['NOTIFICATIONS', 'COMPOSE'] },
      { label: 'History', to: ROUTES.NOTIFICATIONS_HISTORY, icon: <BsList />, permission: ['NOTIFICATIONS', 'VIEW_HISTORY'] },
    ],
  },
  { label: 'Bookings', to: ROUTES.BOOKINGS, icon: <BsCalendarCheck />, permission: ['BOOKINGS', 'VIEW'] },
  { label: 'Disputes', to: ROUTES.DISPUTES, icon: <BsExclamationTriangle />, permission: ['DISPUTES', 'VIEW'] },
  { label: 'Reports', to: ROUTES.REPORTS, icon: <BsBarChart />, permission: ['REPORTS', 'VIEW'] },
  {
    label: 'Configurations', to: '#', icon: <BsGear />,
    children: [
      { label: 'Sports', to: ROUTES.CONFIGURATIONS_SPORTS, icon: <BsTrophy />, permission: ['CONFIGURATIONS_SPORTS', 'VIEW'] },
    ],
  },
]

function canShowItem(item: NavItem): boolean {
  if (!item.permission) return true
  return RbacService.can(item.permission[0], item.permission[1])
}

export function AdminLayout() {
  const navigate = useNavigate()
  const user = StorageService.getUser()
  const { data: profileData } = useGetProfileQuery()
  const profile = profileData?.data
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(ThemeService.getTheme())
  const [expanded, setExpanded] = useState<string[]>([])
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  const toggleTheme = () => setTheme(ThemeService.toggleTheme())

  const handleLogout = async () => {
    const credentials = AuthService.getLogoutCredentials()

    if (credentials) {
      try {
        await logout(credentials).unwrap()
        toast.success('Logged out successfully')
      } catch {
        // Even if API fails, we still clear local session
        toast.warning('Session cleared locally')
      }
    }

    // Always clear local session and redirect
    AuthService.logout()
    navigate(ROUTES.LOGIN)
  }

  const toggleGroup = (label: string) =>
    setExpanded(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label])

  const displayName = profile?.name ?? user?.name ?? 'Admin'
  const displayAvatar = profile?.avatarUrl ?? user?.avatarUrl
  const avatarLetter = displayName[0].toUpperCase()

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="sidebar-premium" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Brand */}
          <div className="sidebar-brand">
            <img src={logo} alt="Sportify Admin" style={{ height: '32px' }} />
            <div>
              <div className="sidebar-brand-name">Sportify Admin</div>
              <div className="sidebar-brand-sub">Portal</div>
            </div>
          </div>

          {/* Nav */}
          <div className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
            {NAV_ITEMS.filter(item =>
              item.children ? item.children.some(canShowItem) : canShowItem(item)
            ).map(item => {
              if (item.children) {
                const visible = item.children.filter(canShowItem)
                const isOpen = expanded.includes(item.label)
                return (
                  <div key={item.label}>
                    <button
                      className="sidebar-nav-item"
                      onClick={() => toggleGroup(item.label)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span className={`sidebar-chevron${isOpen ? ' open' : ''}`}>▾</span>
                    </button>
                    {isOpen && (
                      <div className="sidebar-group-children">
                        {visible.map(child => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `sidebar-child-item${isActive ? ' active' : ''}`
                            }
                          >
                            <span className="sidebar-child-icon">{child.icon}</span>
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ marginLeft: sidebarOpen ? 240 : 0, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div className="topbar-premium">
          <button
            className="topbar-btn me-3"
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle sidebar"
          >
            <BsList size={20} />
          </button>
          <span className="topbar-title">Welcome 👋</span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <button
              className="topbar-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'dark' ? <BsSun size={18} /> : <BsMoon size={18} />}
            </button>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="p-0 d-flex align-items-center gap-2 text-decoration-none no-caret"
                style={{ color: 'var(--color-text-primary)', boxShadow: 'none' }}
                id="profile-dd"
              >
                <div className="avatar-circle" style={{ overflow: 'hidden' }}>
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : avatarLetter}
                </div>
                <span
                  className="d-none d-md-inline"
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}
                >
                  {displayName}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to={ROUTES.PROFILE}>
                  <BsPerson className="me-2" />Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger" disabled={isLoggingOut}>
                  {isLoggingOut ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Page content */}
        <Container fluid className="py-4 flex-grow-1">
          <Outlet />
        </Container>
      </div>
    </div>
  )
}
