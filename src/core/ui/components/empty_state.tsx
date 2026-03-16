import { BsInboxFill } from 'react-icons/bs'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display.',
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <BsInboxFill />
      </div>
      <div className="empty-state-title">{title}</div>
      <p className="empty-state-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
