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
import { useListLocationsQuery, useApproveVenueMutation, useRejectVenueMutation } from '../../locations/api/locations_api'

export default function ApprovalsLocationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useListLocationsQuery({
    approvalState: ['PENDING', 'REJECTED'],
    page: page - 1,
    size: pageSize,
  })

  const [approveVenue, { isLoading: isApproving }] = useApproveVenueMutation()
  const [rejectVenue, { isLoading: isRejecting }] = useRejectVenueMutation()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  const springPage = data?.data
  const locations = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const handleApprove = async (locationId: number) => {
    try {
      await approveVenue({ venueId: locationId }).unwrap()
      toast.success('Location approved successfully.')
    } catch {
      toast.error('Failed to approve location.')
    }
  }

  const handleRejectClick = (locationId: number) => {
    setSelectedLocationId(locationId)
    setRejectNotes('')
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedLocationId) return
    try {
      await rejectVenue({ venueId: selectedLocationId, request: { notes: rejectNotes } }).unwrap()
      toast.success('Location rejected.')
      setShowRejectModal(false)
    } catch {
      toast.error('Failed to reject location.')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load pending locations." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Location Approvals</h4>
        <Badge bg="warning" text="dark" className="fs-6">{totalItems} Pending</Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {locations.length === 0 ? (
            <EmptyState title="No pending approvals" description="All location requests have been processed." />
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>{l.city ?? '—'}</td>
                      <td><StatusBadge status={l.state.toLowerCase()} /></td>
                      <td><Badge bg={l.active ? 'success' : 'secondary'}>{l.active ? 'Active' : 'Inactive'}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/approvals/locations/${l.id}`)}>
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

