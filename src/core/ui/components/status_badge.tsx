type StatusValue = string

function getVariant(status: StatusValue): string {
  switch (status) {
    // Approval
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    // Booking
    case 'confirmed': return 'primary'
    case 'in_progress': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'secondary'
    // Payment
    case 'paid': return 'success'
    case 'failed': return 'danger'
    case 'refunded': return 'info'
    // Dispute
    case 'active': return 'danger'
    case 'closed': return 'secondary'
    // Shared
    case 'pending': return 'warning'
    default: return 'secondary'
  }
}

interface StatusBadgeProps {
  status: StatusValue
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = getVariant(status)
  const label = String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <span className={`badge badge-status-${variant}`}>{label}</span>
}
