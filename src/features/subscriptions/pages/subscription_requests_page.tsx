import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Form, Row, Col, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsPlus, BsEye } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import RbacService from '../../../core/services/rbac_service'
import StorageService from '../../../core/services/storage_service'
import { ROUTES } from '../../../core/constants/routes'
import { useListSubscriptionRequestsMutation, useReviewSubscriptionRequestMutation } from '../api/subscriptions_api'
import type { SubscriptionRequestStatusDto } from '../api/subscriptions_types'

const STATUS_OPTIONS: SubscriptionRequestStatusDto[] = ['PENDING', 'APPROVED', 'REJECTED']

export default function SubscriptionRequestsPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('SUBSCRIPTIONS_REQUESTS', 'CREATE')
  const canProcess = RbacService.can('SUBSCRIPTIONS_REQUESTS', 'APPROVE')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [remarks, setRemarks] = useState('')
  const pageSize = 20

  const [listSubscriptionRequests, { data, isLoading, isError }] = useListSubscriptionRequestsMutation()
  const [reviewRequest, { isLoading: isReviewing }] = useReviewSubscriptionRequestMutation()

  useEffect(() => {
    listSubscriptionRequests({
      status: statusFilter || undefined,
      page: page - 1,
      size: pageSize,
    })
  }, [statusFilter, page])

  const requests = data?.data?.content ?? []
  const totalPages = data?.data?.totalPages ?? 0
  const totalItems = data?.data?.totalElements ?? 0

  const handleAction = async () => {
    if (selectedId === null) return
    const adminUser = StorageService.getUser()
    try {
      await reviewRequest({
        requestId: selectedId,
        request: {
          adminUserId: Number(adminUser?.id),
          decision: action,
          notes: remarks || undefined,
        },
      }).unwrap()
      toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'}.`)
      listSubscriptionRequests({
        status: statusFilter || undefined,
        page: page - 1,
        size: pageSize,
      })
    } catch (err: unknown) {
      const e = err as { data?: { errorMessage?: string } }
      toast.error(e?.data?.errorMessage || 'Failed to review request.')
    }
    setShowConfirm(false)
    setRemarks('')
  }

  const openDialog = (id: number, actionType: 'APPROVE' | 'REJECT') => {
    setSelectedId(id)
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Subscription Requests</h4>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS_CREATE)}>
            <BsPlus className="me-1" /> Create Request
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : isError ? (
            <div className="text-center py-4 text-muted">Failed to load subscription requests.</div>
          ) : requests.length === 0 ? (
            <EmptyState title="No subscription requests" />
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Current Plan</th>
                    <th>Requested Plan</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>{r.providerName || `User #${r.providerUserId}`}</td>
                      <td>{r.currentPlanName || 'None'}</td>
                      <td>{r.requestedPlanName || `Plan #${r.requestedPlanConfigId}`}</td>
                      <td>
                        <Badge
                          bg={statusBadge(r.status)}
                          text={r.status === 'PENDING' ? 'dark' : undefined}
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td>{new Date(r.createdOn).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS_VIEW.replace(':id', String(r.id)))}
                          >
                            <BsEye />
                          </Button>
                          {canProcess && r.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => openDialog(r.id, 'APPROVE')}>
                                Approve
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => openDialog(r.id, 'REJECT')}>
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
              />
            </>
          )}
        </Card.Body>
      </Card>
      <ConfirmDialog
        show={showConfirm}
        title={action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
        message={`Are you sure you want to ${action.toLowerCase()} this subscription request?`}
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
