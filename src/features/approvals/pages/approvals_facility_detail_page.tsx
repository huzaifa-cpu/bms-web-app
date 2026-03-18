import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge, Modal, Form, Carousel, Table } from 'react-bootstrap'
import { BsArrowLeft, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetFacilityMutation, useApproveFacilityMutation, useRejectFacilityMutation } from '../../facilities/api/facilities_api'

export default function ApprovalsFacilityDetailPage() {
  const { facilityId } = useParams()
  const navigate = useNavigate()

  const [getFacility, { data, isLoading, error }] = useGetFacilityMutation()
  const facility = data?.data

  useEffect(() => {
    if (facilityId) getFacility(Number(facilityId))
  }, [facilityId])

  const [approveFacility, { isLoading: isApproving }] = useApproveFacilityMutation()
  const [rejectFacility, { isLoading: isRejecting }] = useRejectFacilityMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const handleApprove = async () => {
    try {
      await approveFacility({ facilityId: Number(facilityId) }).unwrap()
      toast.success('Facility approved successfully.')
      navigate('/approvals/facilities')
    } catch {
      toast.error('Failed to approve facility.')
    }
  }

  const handleRejectConfirm = async () => {
    try {
      await rejectFacility({ facilityId: Number(facilityId), request: { notes: rejectNotes } }).unwrap()
      toast.success('Facility rejected.')
      navigate('/approvals/facilities')
    } catch {
      toast.error('Failed to reject facility.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error || !facility) return <ErrorState error="Facility not found." onRetry={() => getFacility(Number(facilityId))} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/approvals/facilities')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">{facility.name}</h4>
        <Badge bg="warning" text="dark">Pending Approval</Badge>
        <Badge bg={facility.active ? 'success' : 'secondary'}>{facility.active ? 'Active' : 'Inactive'}</Badge>
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

      <Row>
        <Col lg={8}>
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
            <Card className="shadow-sm mb-4">
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
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header><strong>Actions</strong></Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">Review the facility details and make a decision.</p>
              <div className="d-grid gap-2">
                <Button variant="success" size="lg" onClick={handleApprove} disabled={isApproving}>
                  <BsCheckCircle className="me-2" />
                  {isApproving ? 'Approving...' : 'Approve Facility'}
                </Button>
                <Button variant="outline-danger" size="lg" onClick={() => setShowRejectModal(true)} disabled={isRejecting}>
                  <BsXCircle className="me-2" />
                  Reject Facility
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Facility</Modal.Title>
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
            {isRejecting ? 'Rejecting...' : 'Reject Facility'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
