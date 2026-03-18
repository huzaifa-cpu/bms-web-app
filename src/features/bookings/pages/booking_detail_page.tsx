import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Form } from 'react-bootstrap'
import { BsArrowLeft, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import RbacService from '../../../core/services/rbac_service'
import { useGetBookingMutation, useForceCancelBookingMutation } from '../api/bookings_api'
import { formatDateTime } from '../../../core/utils/date_utils'
import { formatCurrency } from '../../../core/utils/number_utils'
import StorageService from '../../../core/services/storage_service'

function getAdminUserId(): number {
  const user = StorageService.getUser()
  return user ? Number(user.id) : 0
}

export default function BookingDetailPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [getBooking, { data, isLoading, error }] = useGetBookingMutation()
  const booking = data?.data

  const refetch = () => getBooking(Number(bookingId))

  useEffect(() => {
    getBooking(Number(bookingId))
  }, [bookingId])

  const [forceCancel, { isLoading: isCancelling }] = useForceCancelBookingMutation()

  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  if (isLoading) return <Loader fullPage />
  if (error || !booking) return <ErrorState error="Booking not found." onRetry={refetch} />

  const canCancel = RbacService.can('BOOKINGS', 'FORCE_CANCEL')
  const isCancelable = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED'

  const handleCancel = async () => {
    if (!cancelReason.trim()) { setCancelError('Reason is required.'); return }
    try {
      await forceCancel({
        bookingId: booking.id,
        request: { adminUserId: getAdminUserId(), notes: cancelReason },
      }).unwrap()
      setCancelError('')
      setShowCancel(false)
      toast.success('Booking force-cancelled.')
    } catch {
      toast.error('Failed to cancel booking.')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/bookings')}><BsArrowLeft className="me-1" />Back</Button>
        <h4 className="fw-bold mb-0">Booking #{booking.bookingRef ?? booking.id}</h4>
        <StatusBadge status={booking.status.toLowerCase()} />
      </div>
      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header><strong>Booking Details</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}><small className="text-muted">Consumer</small><p>{booking.consumerName ?? booking.consumerUserId}</p></Col>
                <Col sm={6}><small className="text-muted">Provider</small><p>{booking.providerName ?? booking.providerUserId}</p></Col>
                <Col sm={6}><small className="text-muted">Location</small><p>{booking.locationName ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Facility</small><p>{booking.facilityName ?? booking.facilityId}</p></Col>
                <Col sm={6}><small className="text-muted">Booking Date</small><p>{booking.bookingDate ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted">Start Time</small><p>{formatDateTime(booking.startTime)}</p></Col>
                <Col sm={6}><small className="text-muted">End Time</small><p>{formatDateTime(booking.endTime)}</p></Col>
                <Col sm={6}><small className="text-muted">Amount</small><p className="fw-bold">{formatCurrency(booking.amount)}</p></Col>
                <Col sm={6}><small className="text-muted">Payment Status</small><p>{booking.paymentStatus ? <StatusBadge status={booking.paymentStatus.toLowerCase()} /> : '—'}</p></Col>
                {booking.cancelNotes && <Col sm={12}><small className="text-muted">Cancellation Notes</small><p>{booking.cancelNotes}</p></Col>}
                {booking.notes && <Col sm={12}><small className="text-muted">Notes</small><p>{booking.notes}</p></Col>}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header><strong>Actions</strong></Card.Header>
            <Card.Body>
              {canCancel && isCancelable ? (
                <Button variant="danger" className="w-100" onClick={() => setShowCancel(true)} disabled={isCancelling}>
                  <BsXCircle className="me-2" />Force Cancel
                </Button>
              ) : (
                <p className="text-muted small">
                  {!isCancelable ? 'Booking cannot be cancelled in its current state.' : 'No permission to cancel bookings.'}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ConfirmDialog
        show={showCancel}
        title="Force Cancel Booking"
        message="Provide a reason for force-cancelling this booking:"
        confirmLabel="Force Cancel"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => { setShowCancel(false); setCancelReason(''); setCancelError('') }}
      >
        <Form.Group>
          <Form.Control as="textarea" rows={3} placeholder="Reason (required)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} isInvalid={!!cancelError} />
          <Form.Control.Feedback type="invalid">{cancelError}</Form.Control.Feedback>
        </Form.Group>
      </ConfirmDialog>
    </div>
  )
}
