import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge, Table, Carousel } from 'react-bootstrap'
import { BsArrowLeft, BsPencil } from 'react-icons/bs'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetFacilityMutation } from '../api/facilities_api'
import RbacService from '../../../core/services/rbac_service'

export default function FacilityDetailPage() {
  const { facilityId } = useParams()
  const navigate = useNavigate()
  const canEdit = RbacService.can('FACILITIES', 'UPDATE')

  const [getFacility, { data, isLoading, error }] = useGetFacilityMutation()
  const facility = data?.data

  useEffect(() => {
    if (facilityId) getFacility(Number(facilityId))
  }, [facilityId])

  if (isLoading) return <Loader fullPage />
  if (error || !facility) return <ErrorState error="Facility not found." onRetry={() => getFacility(Number(facilityId))} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/facilities')}><BsArrowLeft className="me-1" />Back</Button>
        <h4 className="fw-bold mb-0">{facility.name}</h4>
        <StatusBadge status={facility.state.toLowerCase()} />
        <Badge bg={facility.active ? 'success' : 'secondary'}>{facility.active ? 'Active' : 'Inactive'}</Badge>
        {canEdit && <Button variant="outline-primary" size="sm" onClick={() => navigate(`/facilities/${facilityId}/edit`)}><BsPencil className="me-1" />Edit</Button>}
      </div>

      {/* Images Carousel */}
      {facility.imageUrls && facility.imageUrls.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header><strong>Images</strong></Card.Header>
          <Card.Body className="p-0">
            <Carousel>
              {facility.imageUrls.map((url, index) => (
                <Carousel.Item key={index}>
                  <img src={url} alt={`Facility ${index + 1}`} className="d-block w-100" style={{ height: 300, objectFit: 'cover' }} />
                </Carousel.Item>
              ))}
            </Carousel>
          </Card.Body>
        </Card>
      )}

      {/* Basic Info */}
      <Card className="shadow-sm mb-4">
        <Card.Header><strong>Basic Information</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Name</small><p>{facility.name}</p></Col>
            <Col sm={6}><small className="text-muted">Sport</small><p>{facility.sportName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Provider</small><p>{facility.providerName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Location</small><p>{facility.locationName ?? '—'}</p></Col>
            <Col sm={12}><small className="text-muted">Description</small><p>{facility.description ?? '—'}</p></Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Schedule & Pricing */}
      {facility.schedules && facility.schedules.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header><strong>Schedule & Pricing</strong></Card.Header>
          <Card.Body>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Price/Hour</th>
                </tr>
              </thead>
              <tbody>
                {facility.schedules.map((schedule) => (
                  <tr key={schedule.dayOfWeek}>
                    <td className="fw-medium">{schedule.dayOfWeek}</td>
                    <td>
                      <Badge bg={schedule.enabled ? 'success' : 'secondary'}>
                        {schedule.enabled ? 'Open' : 'Closed'}
                      </Badge>
                    </td>
                    <td>{schedule.enabled ? `${schedule.startTime} - ${schedule.endTime}` : '—'}</td>
                    <td>{schedule.enabled && schedule.pricePerHour ? `PKR ${schedule.pricePerHour}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
