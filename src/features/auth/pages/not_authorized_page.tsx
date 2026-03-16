import { Card, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsShieldLock } from 'react-icons/bs'
import { ROUTES } from '../../../core/constants/routes'

export default function NotAuthorizedPage() {
  const navigate = useNavigate()
  return (
    <Card className="shadow-sm text-center">
      <Card.Body className="p-5">
        <BsShieldLock size={48} className="text-danger mb-3" />
        <h4 className="mb-2">Access Denied</h4>
        <p className="text-muted mb-4">You do not have permission to view this page.</p>
        <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Go to Dashboard
        </Button>
      </Card.Body>
    </Card>
  )
}
