import { useEffect } from 'react'
import { Row, Col, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  BsPersonCheck, BsGeoAlt, BsBuildingGear, BsCalendarCheck,
  BsExclamationTriangle, BsPeople,
  BsPersonBadge, BsArrowRight,
} from 'react-icons/bs'
import { ROUTES } from '../../../core/constants/routes'
import { useGetDashboardStatsMutation } from '../api/dashboard_api'

interface KpiCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  variant?: string
}

const VARIANT_COLORS: Record<string, { bg: string; color: string }> = {
  primary:   { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
  success:   { bg: '#D1FAE5', color: '#059669' },
  info:      { bg: '#DBEAFE', color: '#2563EB' },
  danger:    { bg: '#FEE2E2', color: '#DC2626' },
  warning:   { bg: '#FEF3C7', color: '#D97706' },
  secondary: { bg: '#F3F4F6', color: '#6B7280' },
}

function KpiCard({ label, value, icon, variant = 'primary' }: KpiCardProps) {
  const colors = VARIANT_COLORS[variant] ?? VARIANT_COLORS.primary
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrap" style={{ backgroundColor: colors.bg, color: colors.color }}>
        {icon}
      </div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  )
}

interface QueueCardProps {
  label: string
  count: number
  icon: React.ReactNode
  to: string
}

function QueueCard({ label, count, icon, to }: QueueCardProps) {
  const navigate = useNavigate()
  return (
    <div className="queue-card" onClick={() => navigate(to)}>
      <div className="d-flex align-items-center gap-3">
        <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {count} pending
          </div>
        </div>
      </div>
      <BsArrowRight className="queue-card-arrow" />
    </div>
  )
}

export default function DashboardPage() {
  const [getDashboardStats, { data: stats, isLoading, isError }] = useGetDashboardStatsMutation()
  useEffect(() => { getDashboardStats() }, [])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-5 text-muted">
        Failed to load dashboard stats. Please try again.
      </div>
    )
  }

  const totalPendingApprovals =
    stats.pendingProviderApprovals + stats.pendingLocationApprovals + stats.pendingFacilityApprovals

  const kpis = [
    { label: 'Total Providers', value: stats.totalProviders, icon: <BsPersonBadge />, variant: 'primary' },
    { label: 'Total Consumers', value: stats.totalConsumers, icon: <BsPeople />, variant: 'success' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: <BsCalendarCheck />, variant: 'info' },
    { label: 'Open Disputes', value: stats.openDisputes, icon: <BsExclamationTriangle />, variant: 'danger' },
    { label: 'Pending Approvals', value: totalPendingApprovals, icon: <BsPersonCheck />, variant: 'warning' },
    { label: 'Total Locations', value: stats.totalLocations, icon: <BsGeoAlt />, variant: 'primary' },
    { label: 'Total Facilities', value: stats.totalFacilities, icon: <BsBuildingGear />, variant: 'info' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <BsCalendarCheck />, variant: 'secondary' },
    { label: 'Completed Bookings', value: stats.completedBookings, icon: <BsCalendarCheck />, variant: 'success' },
  ]

  const queues = [
    { label: 'Provider Approvals', count: stats.pendingProviderApprovals, icon: <BsPersonBadge />, to: ROUTES.APPROVALS_PROVIDERS },
    { label: 'Location Approvals', count: stats.pendingLocationApprovals, icon: <BsGeoAlt />, to: ROUTES.APPROVALS_LOCATIONS },
    { label: 'Facility Approvals', count: stats.pendingFacilityApprovals, icon: <BsBuildingGear />, to: ROUTES.APPROVALS_FACILITIES },
    { label: 'Active Disputes', count: stats.openDisputes, icon: <BsExclamationTriangle />, to: ROUTES.DISPUTES },
  ]

  return (
    <div>
      <h4 className="mb-4 fw-bold">Dashboard</h4>

      {/* KPI Grid */}
      <Row className="g-3 mb-4">
        {kpis.map(kpi => (
          <Col key={kpi.label} xs={12} sm={6} md={4} lg={3}>
            <KpiCard {...kpi} />
          </Col>
        ))}
      </Row>

      {/* Quick-action queues */}
      <h5 className="mb-3 fw-semibold">Pending Queues</h5>
      <Row className="g-3">
        {queues.map(q => (
          <Col key={q.label} xs={12} sm={6} md={4}>
            <QueueCard {...q} />
          </Col>
        ))}
      </Row>
    </div>
  )
}
