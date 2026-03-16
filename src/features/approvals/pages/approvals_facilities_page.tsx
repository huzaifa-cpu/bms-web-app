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
import { useListFacilitiesQuery, useApproveFacilityMutation, useRejectFacilityMutation } from '../../facilities/api/facilities_api'

export default function ApprovalsFacilitiesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useListFacilitiesQuery({
    approvalState: ['PENDING', 'REJECTED'],
    page: page - 1,
    size: pageSize,
  })

  const [approveFacility, { isLoading: isApproving }] = useApproveFacilityMutation()
  const [rejectFacility, { isLoading: isRejecting }] = useRejectFacilityMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  const springPage = data?.data
  const facilities = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const handleApprove = async (facilityId: number) => {
    try {
      await approveFacility({ facilityId }).unwrap()
      toast.success('Facility approved successfully.')
    } catch {
      toast.error('Failed to approve facility.')
    }
  }

  const handleRejectClick = (facilityId: number) => {
    setSelectedFacilityId(facilityId)
    setRejectNotes('')
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedFacilityId) return
    try {
      await rejectFacility({ facilityId: selectedFacilityId, request: { notes: rejectNotes } }).unwrap()
      toast.success('Facility rejected.')
      setShowRejectModal(false)
    } catch {
      toast.error('Failed to reject facility.')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load pending facilities." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Facility Approvals</h4>
        <Badge bg="warning" text="dark" className="fs-6">{totalItems} Pending</Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {facilities.length === 0 ? (
            <EmptyState title="No pending approvals" description="All facility requests have been processed." />
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sport</th>
                    <th>Location</th>
                    <th>State</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f) => (
                    <tr key={f.id}>
                      <td>{f.name}</td>
                      <td>{f.sportName ?? '—'}</td>
                      <td>{f.venueName ?? '—'}</td>
                      <td><StatusBadge status={f.state.toLowerCase()} /></td>
                      <td><Badge bg={f.active ? 'success' : 'secondary'}>{f.active ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/approvals/facilities/${f.id}`)}>
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

