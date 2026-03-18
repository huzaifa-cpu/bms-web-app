import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Row, Col, Button, Form, Alert, Modal, Table } from 'react-bootstrap'
import { BsArrowLeft, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import RbacService from '../../../core/services/rbac_service'
import { useGetDisputeDetailsMutation, useResolveDisputeMutation, useCloseDisputeMutation } from '../api/disputes_api'
import { formatDateTime } from '../../../core/utils/date_utils'
import StorageService from '../../../core/services/storage_service'
import { ROUTES } from '../../../core/constants/routes'

function getAdminUserId(): number {
  const user = StorageService.getUser()
  return user ? Number(user.id) : 0
}

export default function DisputeDetailPage() {
  const { disputeId } = useParams()
  const navigate = useNavigate()

  const [getDisputeDetails, { data, isLoading, error }] = useGetDisputeDetailsMutation()
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation()
  const [closeDispute, { isLoading: isClosing }] = useCloseDisputeMutation()

  const [showResolve, setShowResolve] = useState(false)
  const [resolution, setResolution] = useState('')
  const [resolutionError, setResolutionError] = useState('')

  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closeNotes, setCloseNotes] = useState('')

  useEffect(() => {
    getDisputeDetails({
      disputeId: Number(disputeId),
      adminUserId: getAdminUserId(),
    })
  }, [disputeId])

  const refetch = () => {
    getDisputeDetails({
      disputeId: Number(disputeId),
      adminUserId: getAdminUserId(),
    })
  }

  if (isLoading) return <Loader fullPage />
  if (error || !data?.data) return <ErrorState error="Dispute not found." onRetry={refetch} />

  const dispute = data.data.dispute
  const messages = data.data.messages ?? []
  const evidence = data.data.evidence ?? []
  const canClose = RbacService.can('DISPUTES', 'CLOSE')
  const isClosed = dispute.status === 'RESOLVED' || dispute.status === 'CLOSED'

  const handleResolve = async () => {
    if (!resolution.trim()) { setResolutionError('Resolution notes are required.'); return }
    try {
      await resolveDispute({
        disputeId: dispute.id,
        request: {
          adminUserId: getAdminUserId(),
          resolution: 'OTHER',
          resolutionNotes: resolution,
        },
      }).unwrap()
      setResolutionError('')
      setShowResolve(false)
      toast.success('Dispute resolved.')
    } catch {
      toast.error('Failed to resolve dispute.')
    }
  }

  const handleCloseDispute = async () => {
    try {
      await closeDispute({
        disputeId: dispute.id,
        request: {
          adminUserId: getAdminUserId(),
          status: 'CLOSED',
          notes: closeNotes || undefined,
        },
      }).unwrap()
      setShowCloseModal(false)
      setCloseNotes('')
      toast.success('Dispute closed.')
    } catch {
      toast.error('Failed to close dispute.')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.DISPUTES)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Dispute #{dispute.id}</h4>
        <StatusBadge status={dispute.status.toLowerCase()} />
      </div>

      <Row className="g-4">
        <Col md={8}>
          {/* Dispute Details */}
          <Card className="shadow-sm mb-4">
            <Card.Header><strong>Dispute Details</strong></Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <small className="text-muted d-block">Subject</small>
                  <p className="fw-semibold mb-0">{dispute.subject}</p>
                </Col>
                <Col sm={6}>
                  <small className="text-muted d-block">Type</small>
                  <p className="mb-0">{dispute.type?.replace('_', ' ')}</p>
                </Col>
                <Col sm={6}>
                  <small className="text-muted d-block">Raised By</small>
                  <p className="fw-semibold mb-0">
                    {dispute.raisedByName || `Consumer #${dispute.raisedByUserId}`}
                  </p>
                  {dispute.raisedByPhone && (
                    <small className="text-muted">{dispute.raisedByPhone}</small>
                  )}
                </Col>
                {dispute.locationName && (
                  <Col sm={6}>
                    <small className="text-muted d-block">Location</small>
                    <p className="mb-0">{dispute.locationName}</p>
                  </Col>
                )}
                {dispute.facilityName && (
                  <Col sm={6}>
                    <small className="text-muted d-block">Facility</small>
                    <p className="mb-0">{dispute.facilityName}</p>
                  </Col>
                )}
                {dispute.bookingId && (
                  <Col sm={6}>
                    <small className="text-muted d-block">Booking ID</small>
                    <Link to={ROUTES.BOOKING_DETAIL.replace(':bookingId', String(dispute.bookingId))} className="text-primary">
                      #{dispute.bookingId}
                    </Link>
                  </Col>
                )}
                <Col sm={6}>
                  <small className="text-muted d-block">Opened At</small>
                  <p className="mb-0">{formatDateTime(dispute.openedAt)}</p>
                </Col>
                {dispute.closedAt && (
                  <Col sm={6}>
                    <small className="text-muted d-block">Closed At</small>
                    <p className="mb-0">{formatDateTime(dispute.closedAt)}</p>
                  </Col>
                )}
                {dispute.assignedToUserId && (
                  <Col sm={6}>
                    <small className="text-muted d-block">Assigned To (Admin ID)</small>
                    <p className="mb-0">#{dispute.assignedToUserId}</p>
                  </Col>
                )}
                <Col sm={12}>
                  <small className="text-muted d-block">Description</small>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{dispute.description}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Resolution Info */}
          {(dispute.resolution || dispute.resolutionNotes) && (
            <Card className="shadow-sm mb-4">
              <Card.Header><strong>Resolution</strong></Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {dispute.resolution && (
                    <Col sm={6}>
                      <small className="text-muted d-block">Resolution Type</small>
                      <p className="mb-0">{dispute.resolution?.replace('_', ' ')}</p>
                    </Col>
                  )}
                  {dispute.resolutionNotes && (
                    <Col sm={12}>
                      <small className="text-muted d-block">Resolution Notes</small>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{dispute.resolutionNotes}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header><strong>Messages ({messages.length})</strong></Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Message</th>
                      <th>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>
                          <span className="fw-medium">#{msg.authorUserId}</span>
                          <small className="text-muted d-block">{msg.authorParty}</small>
                        </td>
                        <td>{msg.message}</td>
                        <td>{formatDateTime(msg.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Evidence */}
          {evidence.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header><strong>Evidence ({evidence.length})</strong></Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Document ID</th>
                      <th>Uploaded By</th>
                      <th>Note</th>
                      <th>Uploaded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.map((ev) => (
                      <tr key={ev.id}>
                        <td>#{ev.documentId}</td>
                        <td>#{ev.uploadedByUserId}</td>
                        <td>{ev.note ?? '—'}</td>
                        <td>{formatDateTime(ev.uploadedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header><strong>Actions</strong></Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">Review the dispute details and take action.</p>
              {isClosed ? (
                <Alert variant="secondary" className="mb-0">Dispute is {dispute.status.toLowerCase()}.</Alert>
              ) : canClose ? (
                <div className="d-grid gap-2">
                  <Button variant="success" size="lg" onClick={() => setShowResolve(true)} disabled={isResolving}>
                    <BsCheckCircle className="me-2" />Resolve Dispute
                  </Button>
                  <Button variant="outline-danger" size="lg" onClick={() => setShowCloseModal(true)} disabled={isClosing}>
                    <BsXCircle className="me-2" />Close Dispute
                  </Button>
                </div>
              ) : (
                <p className="text-muted small">No permission to resolve disputes.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>


      <ConfirmDialog
        show={showResolve}
        title="Resolve Dispute"
        message="Provide resolution notes to resolve this dispute:"
        confirmLabel="Resolve Dispute"
        variant="primary"
        isLoading={isResolving}
        onConfirm={handleResolve}
        onCancel={() => { setShowResolve(false); setResolution(''); setResolutionError('') }}
      >
        <Form.Group>
          <Form.Control as="textarea" rows={3} placeholder="Resolution notes (required)" value={resolution} onChange={e => setResolution(e.target.value)} isInvalid={!!resolutionError} />
          <Form.Control.Feedback type="invalid">{resolutionError}</Form.Control.Feedback>
        </Form.Group>
      </ConfirmDialog>

      {/* Close Modal */}
      <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Close Dispute</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Closure Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Enter reason for closing..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleCloseDispute} disabled={isClosing}>
            {isClosing ? 'Closing...' : 'Close Dispute'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
