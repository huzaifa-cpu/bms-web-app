import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge, Modal, Form } from 'react-bootstrap'
import { BsArrowLeft, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetLocationMutation, useApproveLocationMutation, useRejectLocationMutation } from '../../locations/api/locations_api'

export default function ApprovalsLocationDetailPage() {
  const { locationId } = useParams()
  const navigate = useNavigate()

  const [getLocation, { data, isLoading, error }] = useGetLocationMutation()

  useEffect(() => {
    getLocation(Number(locationId))
  }, [locationId])

  const location = data?.data

  const [approveLocation, { isLoading: isApproving }] = useApproveLocationMutation()
  const [rejectLocation, { isLoading: isRejecting }] = useRejectLocationMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const handleApprove = async () => {
    try {
      await approveLocation({ locationId: Number(locationId) }).unwrap()
      toast.success('Location approved successfully.')
      navigate('/approvals/locations')
    } catch {
      toast.error('Failed to approve location.')
    }
  }

  const handleRejectConfirm = async () => {
    try {
      await rejectLocation({ locationId: Number(locationId), request: { notes: rejectNotes } }).unwrap()
      toast.success('Location rejected.')
      navigate('/approvals/locations')
    } catch {
      toast.error('Failed to reject location.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error || !location) return <ErrorState error="Location not found." onRetry={() => getLocation(Number(locationId))} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/approvals/locations')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <div>
          <h4 className="fw-bold mb-0">{location.name}</h4>
          <small className="text-muted">Location Approval Request</small>
        </div>
        <Badge bg="warning" text="dark" className="ms-2">Pending Approval</Badge>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header><strong>Location Details</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}><small className="text-muted">Name</small><p className="fw-semibold">{location.name}</p></Col>
                <Col sm={6}><small className="text-muted">City</small><p className="fw-semibold">{location.city ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Country</small><p>{location.country ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Address</small><p>{location.addressLine1 ?? '—'}</p></Col>
              </Row>
            </Card.Body>
          </Card>

          {location.description && (
            <Card className="shadow-sm mb-4">
              <Card.Header><strong>Description</strong></Card.Header>
              <Card.Body>
                <p>{location.description}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header><strong>Actions</strong></Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">Review the location details and make a decision.</p>
              <div className="d-grid gap-2">
                <Button variant="success" size="lg" onClick={handleApprove} disabled={isApproving}>
                  <BsCheckCircle className="me-2" />
                  {isApproving ? 'Approving...' : 'Approve Location'}
                </Button>
                <Button variant="outline-danger" size="lg" onClick={() => setShowRejectModal(true)} disabled={isRejecting}>
                  <BsXCircle className="me-2" />
                  Reject Location
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Location</Modal.Title>
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
            {isRejecting ? 'Rejecting...' : 'Reject Location'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
