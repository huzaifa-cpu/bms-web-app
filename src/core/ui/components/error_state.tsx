import { Button } from 'react-bootstrap'
import { BsExclamationTriangleFill } from 'react-icons/bs'
import type { AppError } from '../../errors/app_error'

interface ErrorStateProps {
  error?: AppError | string
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = typeof error === 'string'
    ? error
    : (error?.message ?? 'An unexpected error occurred.')

  return (
    <div className="error-state">
      <div className="error-state-card">
        <div className="error-state-icon">
          <BsExclamationTriangleFill />
        </div>
        <div className="error-state-title">Something went wrong</div>
        <p className="error-state-msg">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button variant="outline-danger" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
