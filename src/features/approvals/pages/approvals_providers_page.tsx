import { useState } from 'react'
import { Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsEye, BsCheckCircle, BsXCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { useListProvidersQuery, useApproveProviderMutation, useRejectProviderMutation } from '../../providers/api/providers_api'

export default function ApprovalsProvidersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useListProvidersQuery({
    approvalStates: ['PENDING', 'REJECTED'],
    page: page - 1,
    size: pageSize,
  })

  const [approveProvider, { isLoading: isApproving }] = useApproveProviderMutation()
  const [rejectProvider, { isLoading: isRejecting }] = useRejectProviderMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  const springPage = data?.data
  const providers = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const handleApprove = async (providerId: number) => {
    try {
      await approveProvider({ providerId }).unwrap()
      toast.success('Provider approved successfully.')
    } catch {
      toast.error('Failed to approve provider.')
    }
  }

  const handleRejectClick = (providerId: number) => {
    setSelectedProviderId(providerId)
    setRejectNotes('')
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedProviderId) return
    try {
      await rejectProvider({ providerId: selectedProviderId, notes: rejectNotes }).unwrap()
      toast.success('Provider rejected.')
      setShowRejectModal(false)
    } catch {
      toast.error('Failed to reject provider.')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load pending providers." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Provider Approvals</h4>
        <Badge bg="warning" text="dark" className="fs-6">{totalItems} Pending</Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {providers.length === 0 ? (
            <EmptyState title="No pending approvals" description="All provider requests have been processed." />
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Business Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.businessName ?? '-'}</td>
                      <td>{p.email}</td>
                      <td>{p.mobileNumber}</td>
                      <td>{p.approvalState ? <StatusBadge status={p.approvalState.toLowerCase()} /> : '—'}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/approvals/providers/${p.id}`)}>
                          <BsEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} />
            </>
          )}
        </Card.Body>
      </Card>

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

