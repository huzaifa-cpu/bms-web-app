import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { BsArrowLeft, BsPencil } from 'react-icons/bs'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetLocationQuery } from '../api/locations_api'
import RbacService from '../../../core/services/rbac_service'

export default function LocationDetailPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()
  const canEdit = RbacService.can('LOCATIONS', 'UPDATE')

  const { data, isLoading, error, refetch } = useGetLocationQuery(Number(locationId))
  const location = data?.data

  if (isLoading) return <Loader fullPage />
  if (error || !location) return <ErrorState error="Location not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/locations')}><BsArrowLeft className="me-1" />Back</Button>
        <h4 className="fw-bold mb-0">{location.name}</h4>
        <StatusBadge status={location.state.toLowerCase()} />
        <Badge bg={location.active ? 'success' : 'secondary'}>{location.active ? 'Active' : 'Inactive'}</Badge>
        {canEdit && <Button variant="outline-primary" size="sm" onClick={() => navigate(`/locations/${locationId}/edit`)}><BsPencil className="me-1" />Edit</Button>}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Provider</small><p>{location.providerName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Name</small><p>{location.name}</p></Col>
            <Col sm={6}><small className="text-muted">Address</small><p>{location.addressLine1 ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">City</small><p>{location.city ?? '—'}</p></Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
