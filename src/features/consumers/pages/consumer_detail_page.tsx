import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { BsArrowLeft, BsController, BsGeoAlt, BsCalendar, BsGenderAmbiguous } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetConsumerQuery } from '../api/consumers_api'
import { formatDateTime } from '../../../core/utils/date_utils'

export default function ConsumerDetailPage() {
  const { consumerId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useGetConsumerQuery(Number(consumerId))
  const consumer = data?.data

  if (isLoading) return <Loader fullPage />
  if (error || !consumer) return <ErrorState error="Consumer not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/consumers')}><BsArrowLeft className="me-1" />Back</Button>
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          {consumer.avatarUrl
            ? <img src={consumer.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="text-white fs-5">{consumer.name[0]?.toUpperCase()}</span>
          }
        </div>
        <h4 className="fw-bold mb-0">{consumer.name}</h4>
        <Badge bg={consumer.status === 'ACTIVE' ? 'success' : 'secondary'}>{consumer.status}</Badge>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header><strong>Basic Information</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}><small className="text-muted">Name</small><p>{consumer.name}</p></Col>
                <Col sm={6}><small className="text-muted">Email</small><p>{consumer.email}</p></Col>
                <Col sm={6}><small className="text-muted">Phone</small><p>{consumer.mobileNumber}</p></Col>
                <Col sm={6}><small className="text-muted">Member Since</small><p>{formatDateTime(consumer.createdOn)}</p></Col>
                <Col sm={6}>
                  <small className="text-muted d-flex align-items-center gap-1"><BsCalendar /> Date of Birth</small>
                  <p>{consumer.dateOfBirth ? new Date(consumer.dateOfBirth).toLocaleDateString() : '—'}</p>
                </Col>
                <Col sm={6}>
                  <small className="text-muted d-flex align-items-center gap-1"><BsGenderAmbiguous /> Gender</small>
                  <p>{consumer.gender ?? '—'}</p>
                </Col>
                <Col sm={12}>
                  <small className="text-muted d-flex align-items-center gap-1"><BsGeoAlt /> City</small>
                  <p>{consumer.city ?? '—'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header><strong>Sports Profile</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={12}>
                  <small className="text-muted d-flex align-items-center gap-1"><BsController /> Sports</small>
                  <p>
                    {consumer.sports && consumer.sports.length > 0
                      ? consumer.sports.map(s => <Badge key={s} bg="primary" className="me-1">{s}</Badge>)
                      : '—'
                    }
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header><strong>Bio</strong></Card.Header>
            <Card.Body>
              <p className="mb-0">{consumer.bio || 'No bio provided.'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
