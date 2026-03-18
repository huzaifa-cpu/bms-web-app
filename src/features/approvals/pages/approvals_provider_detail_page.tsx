import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge, Modal, Form } from 'react-bootstrap'
import { BsArrowLeft, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetProviderMutation, useApproveProviderMutation, useRejectProviderMutation } from '../../providers/api/providers_api'
import { formatDateTime, formatDate } from '../../../core/utils/date_utils'

export default function ApprovalsProviderDetailPage() {
  const { providerId } = useParams()
  const navigate = useNavigate()

  const [getProvider, { data, isLoading, error }] = useGetProviderMutation()

  useEffect(() => {
    getProvider(Number(providerId))
  }, [providerId])

  const provider = data?.data

  const [approveProvider, { isLoading: isApproving }] = useApproveProviderMutation()
  const [rejectProvider, { isLoading: isRejecting }] = useRejectProviderMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const handleApprove = async () => {
    try {
      await approveProvider({ providerId: Number(providerId) }).unwrap()
      toast.success('Provider approved successfully.')
      navigate('/approvals/providers')
    } catch {
      toast.error('Failed to approve provider.')
    }
  }

  const handleRejectConfirm = async () => {
    try {
      await rejectProvider({ providerId: Number(providerId), notes: rejectNotes }).unwrap()
      toast.success('Provider rejected.')
      navigate('/approvals/providers')
    } catch {
      toast.error('Failed to reject provider.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error || !provider) return <ErrorState error="Provider not found." onRetry={() => getProvider(Number(providerId))} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/approvals/providers')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          {provider.avatarUrl
            ? <img src={provider.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="text-white fs-5">{provider.name[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <h4 className="fw-bold mb-0">{provider.businessName || provider.name}</h4>
          <small className="text-muted">Provider Approval Request</small>
        </div>
        <Badge bg="warning" text="dark" className="ms-2">Pending Approval</Badge>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header><strong>Provider Details</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}><small className="text-muted">Full Name</small><p className="fw-semibold">{provider.name}</p></Col>
                <Col sm={6}><small className="text-muted">Business Name</small><p className="fw-semibold">{provider.businessName ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Email</small><p className="fw-semibold">{provider.email}</p></Col>
                <Col sm={6}><small className="text-muted">Phone</small><p className="fw-semibold">{provider.mobileNumber}</p></Col>
                <Col sm={6}><small className="text-muted">Support Phone</small><p>{provider.supportPhone ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Support Email</small><p>{provider.supportEmail ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Subscription Plan</small><p>{provider.planName ? <Badge bg="primary">{provider.planName}</Badge> : '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Registered</small><p>{formatDateTime(provider.createdOn)}</p></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
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
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header><strong>Actions</strong></Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">Review the provider details and make a decision.</p>
              <div className="d-grid gap-2">
                <Button variant="success" size="lg" onClick={handleApprove} disabled={isApproving}>
                  <BsCheckCircle className="me-2" />
                  {isApproving ? 'Approving...' : 'Approve Provider'}
                </Button>
                <Button variant="outline-danger" size="lg" onClick={() => setShowRejectModal(true)} disabled={isRejecting}>
                  <BsXCircle className="me-2" />
                  Reject Provider
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Provider</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleRejectConfirm} disabled={isRejecting}>
            {isRejecting ? 'Rejecting...' : 'Reject Provider'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
