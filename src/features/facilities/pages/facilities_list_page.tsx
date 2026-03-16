import { useState } from 'react'
import { Card, Table, Button, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPencil, BsToggleOn, BsToggleOff, BsPlusCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListFacilitiesQuery, useToggleFacilityActiveMutation } from '../api/facilities_api'
import RbacService from '../../../core/services/rbac_service'

export default function FacilitiesListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('FACILITIES', 'CREATE')
  const canEdit = RbacService.can('FACILITIES', 'UPDATE')
  const canToggleStatus = RbacService.can('FACILITIES', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error, refetch } = useListFacilitiesQuery({
    approvalState: ['APPROVED'],
    search: search || undefined,
    page,
    size: pageSize,
  })
  const springPage = data?.data
  const facilities = springPage?.content ?? []

  const [toggleActive] = useToggleFacilityActiveMutation()

  const handleToggleActive = async (facilityId: number, currentActive: boolean) => {
    try {
      await toggleActive({ facilityId, active: !currentActive }).unwrap()
      toast.success('Facility status updated.')
    } catch {
      toast.error('Failed to update facility status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load facilities." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Facilities</h4>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate('/facilities/create')}>
            <BsPlusCircle className="me-2" />Create Facility
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
              </InputGroup>
            </Col>
          </Row>
          {facilities.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Sport</th><th>Location</th><th>Status</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>{facilities.map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>{f.sportName ?? '—'}</td>
                    <td>{f.venueName ?? '—'}</td>
                    <td><StatusBadge status={f.state.toLowerCase()} /></td>
                    <td><Badge bg={f.active ? 'success' : 'secondary'}>{f.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/facilities/${f.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/facilities/${f.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={f.active ? 'outline-danger' : 'outline-success'} title={f.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(f.id, f.active)}>{f.active ? <BsToggleOn /> : <BsToggleOff />}</Button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </Table>
              <Pagination page={page + 1} totalPages={springPage?.totalPages ?? 1} pageSize={pageSize} totalItems={springPage?.totalElements ?? 0} onPageChange={(p) => setPage(p - 1)} />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
