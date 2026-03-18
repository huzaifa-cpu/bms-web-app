import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge, Spinner } from 'react-bootstrap'
import { BsArrowLeft } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useGetNotificationMutation } from '../api/notifications_api'

const statusBadge = (status: string) => {
  switch (status) {
    case 'SENT': return 'success'
    case 'QUEUED': return 'warning'
    case 'FAILED': return 'danger'
    case 'CANCELED': return 'secondary'
    default: return 'secondary'
  }
}

export default function NotificationDetailPage() {
  const { notificationId } = useParams()
  const navigate = useNavigate()
  const [getNotification, { data: notification, isLoading, isError }] = useGetNotificationMutation()

  useEffect(() => {
    getNotification(Number(notificationId))
  }, [notificationId])

  if (isLoading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>
  }

  if (isError || !notification) {
    return <ErrorState error="Notification not found." />
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/notifications/history')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Notification Details</h4>
        <Badge bg={statusBadge(notification.status)}>
          {notification.status}
        </Badge>
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col sm={12}>
              <small className="text-muted">Title</small>
              <p className="fw-bold">{notification.title || '(No title)'}</p>
            </Col>
            <Col sm={12}>
              <small className="text-muted">Message</small>
              <p>{notification.message}</p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Type</small>
              <p><Badge bg="info">{notification.type}</Badge></p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Channel</small>
              <p><Badge bg="secondary">{notification.channel.replace('_', ' ')}</Badge></p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Status</small>
              <p><Badge bg={statusBadge(notification.status)}>{notification.status}</Badge></p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Sent At</small>
              <p>{notification.sentAt ? new Date(notification.sentAt).toLocaleString() : '-'}</p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Reference Type</small>
              <p>{notification.referenceType}</p>
            </Col>
            <Col sm={6}>
              <small className="text-muted">Reference ID</small>
              <p>{notification.referenceId ?? '-'}</p>
            </Col>
            {notification.failureReason && (
              <Col sm={12}>
                <small className="text-muted">Failure Reason</small>
                <p className="text-danger">{notification.failureReason}</p>
              </Col>
            )}
            <Col sm={6}>
              <small className="text-muted">Created</small>
              <p>{new Date(notification.createdOn).toLocaleString()}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
