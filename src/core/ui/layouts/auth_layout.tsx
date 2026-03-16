import { Outlet } from 'react-router-dom'
import logo from '../../../assets/logo.png'

export function AuthLayout() {
  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Sportify Admin" style={{ height: '60px', marginBottom: '16px' }} />
          <h4 className="fw-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Sportify Admin Portal
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Sign in to your account
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
