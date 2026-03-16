import { useState } from 'react'
import { Card, Button, Row, Col, Badge, Spinner, Form } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { BsArrowLeft, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../../core/constants/routes'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import RbacService from '../../../core/services/rbac_service'
import StorageService from '../../../core/services/storage_service'
import { useGetSubscriptionRequestQuery, useReviewSubscriptionRequestMutation } from '../api/subscriptions_api'

export default function ViewSubscriptionRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const requestId = Number(id)

  const canApprove = RbacService.can('SUBSCRIPTIONS_REQUESTS', 'APPROVE')
  const canReject = RbacService.can('SUBSCRIPTIONS_REQUESTS', 'REJECT')

  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [remarks, setRemarks] = useState('')

  const { data, isLoading, isError } = useGetSubscriptionRequestQuery(requestId)
  const [reviewRequest, { isLoading: isReviewing }] = useReviewSubscriptionRequestMutation()

  const request = data?.data

  const handleAction = async () => {
    const adminUser = StorageService.getUser()
    try {
      await reviewRequest({
        requestId,
        request: {
          adminUserId: Number(adminUser?.id),
          decision: action,
          notes: remarks || undefined,
        },
      }).unwrap()
      toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`)
      navigate(ROUTES.SUBSCRIPTION_REQUESTS)
    } catch (err: unknown) {
      const e = err as { data?: { errorMessage?: string } }
      toast.error(e?.data?.errorMessage || 'Failed to review request.')
    }
    setShowConfirm(false)
    setRemarks('')
  }

  const openDialog = (actionType: 'APPROVE' | 'REJECT') => {
    setAction(actionType)
    setRemarks('')
    setShowConfirm(true)
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'APPROVED': return 'success'
      case 'REJECTED': return 'danger'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2 text-muted">Loading request details...</div>
      </div>
    )
  }

  if (isError || !request) {
    return (
      <div className="text-center py-5">
        <div className="text-danger mb-3">Failed to load subscription request.</div>
        <Button variant="outline-secondary" onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS)}>
          Back to Requests
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Subscription Request #{request.id}</h4>
        <Badge bg={statusBadge(request.status)} text={request.status === 'PENDING' ? 'dark' : undefined}>
          {request.status}
        </Badge>
      </div>

      <Row className="g-4">
        {/* Provider Details */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light">
              <h6 className="mb-0 fw-bold">Provider Details</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Name</small>
                <span className="fw-medium">{request.providerName || 'N/A'}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Email</small>
                <span>{request.providerEmail || 'N/A'}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Phone</small>
                <span>{request.providerPhone || 'N/A'}</span>
              </div>
              <div>
                <small className="text-muted d-block">Provider ID</small>
                <span>#{request.providerUserId}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Plan Details */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light">
              <h6 className="mb-0 fw-bold">Plan Details</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Current Plan</small>
                <span className="fw-medium">{request.currentPlanName || 'None'}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Requested Plan</small>
                <span className="fw-bold text-primary">{request.requestedPlanName || `Plan #${request.requestedPlanConfigId}`}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Request Date</small>
                <span>{new Date(request.createdOn).toLocaleString()}</span>
              </div>
              {request.adminNotes && (
                <div>
                  <small className="text-muted d-block">Admin Notes</small>
                  <span>{request.adminNotes}</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Review Details (if reviewed) */}
        {request.status !== 'PENDING' && (
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0 fw-bold">Review Details</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <small className="text-muted d-block">Reviewed By</small>
                    <span>{request.reviewedByName || `Admin #${request.reviewedByUserId}`}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Reviewed At</small>
                    <span>{request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Review Notes</small>
                    <span>{request.reviewNotes || 'No notes'}</span>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Actions (if pending) */}
        {request.status === 'PENDING' && (canApprove || canReject) && (
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex gap-2">
                  {canApprove && (
                    <Button variant="success" onClick={() => openDialog('APPROVE')}>
                      <BsCheckCircle className="me-1" /> Approve Request
                    </Button>
                  )}
                  {canReject && (
                    <Button variant="danger" onClick={() => openDialog('REJECT')}>
                      <BsXCircle className="me-1" /> Reject Request
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <ConfirmDialog
        show={showConfirm}
        title={action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
        message={`Are you sure you want to ${action.toLowerCase()} this subscription request?${action === 'APPROVE' ? ' The provider\'s subscription plan will be updated.' : ''}`}
        confirmLabel={action === 'APPROVE' ? 'Approve' : 'Reject'}
        variant={action === 'APPROVE' ? 'primary' : 'danger'}
        onConfirm={handleAction}
        onCancel={() => { setShowConfirm(false); setRemarks('') }}
        isLoading={isReviewing}
      >
        <Form.Group className="mt-3">
          <Form.Label>Remarks / Comments</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Add remarks or comments..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </Form.Group>
      </ConfirmDialog>
    </div>
  )
}

