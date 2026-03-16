import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { BsArrowLeft } from 'react-icons/bs'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetProviderQuery } from '../api/providers_api'
import { formatDateTime, formatDate } from '../../../core/utils/date_utils'

export default function ProviderDetailPage() {
  const { providerId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useGetProviderQuery(Number(providerId))
  const provider = data?.data

  if (isLoading) return <Loader fullPage />
  if (error || !provider) return <ErrorState error="Provider not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/providers')}><BsArrowLeft className="me-1" />Back</Button>
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          {provider.avatarUrl
            ? <img src={provider.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="text-white fs-5">{provider.name[0]?.toUpperCase()}</span>
          }
        </div>
        <h4 className="fw-bold mb-0">{provider.businessName || provider.name}</h4>
        {provider.approvalState && <StatusBadge status={provider.approvalState.toLowerCase()} />}
        <Badge bg={provider.status === 'ACTIVE' ? 'success' : 'secondary'}>{provider.status}</Badge>
      </div>
      <Card className="shadow-sm mb-4">
        <Card.Header><strong>Provider Details</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Name</small><p>{provider.name}</p></Col>
            <Col sm={6}><small className="text-muted">Business Name</small><p>{provider.businessName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Email</small><p>{provider.email}</p></Col>
            <Col sm={6}><small className="text-muted">Phone</small><p>{provider.mobileNumber}</p></Col>
            <Col sm={6}><small className="text-muted">Support Phone</small><p>{provider.supportPhone ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Support Email</small><p>{provider.supportEmail ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Subscription Plan</small><p>{provider.planName ? <Badge bg="primary">{provider.planName}</Badge> : '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Registered</small><p>{formatDateTime(provider.createdOn)}</p></Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header><strong>CNIC Information</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">CNIC Number</small><p>{provider.cnicNumber ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">CNIC Expiry</small><p>{provider.cnicExpiry ? formatDate(provider.cnicExpiry) : '—'}</p></Col>
          </Row>
          <Row className="mt-3">
            <Col md={6}>
              <small className="text-muted d-block mb-2">CNIC Front</small>
              {provider.cnicFrontUrl ? (
                <div className="border rounded p-2" style={{ maxWidth: 300 }}>
                  <img src={provider.cnicFrontUrl} alt="CNIC Front" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
              ) : (
                <p className="text-muted">No image uploaded</p>
              )}
            </Col>
            <Col md={6}>
              <small className="text-muted d-block mb-2">CNIC Back</small>
              {provider.cnicBackUrl ? (
                <div className="border rounded p-2" style={{ maxWidth: 300 }}>
                  <img src={provider.cnicBackUrl} alt="CNIC Back" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
              ) : (
                <p className="text-muted">No image uploaded</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
