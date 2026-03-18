import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPencil, BsToggleOn, BsToggleOff, BsPlusCircle } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListLocationsMutation, useToggleLocationActiveMutation } from '../api/locations_api'
import RbacService from '../../../core/services/rbac_service'

export default function LocationsListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('LOCATIONS', 'CREATE')
  const canEdit = RbacService.can('LOCATIONS', 'UPDATE')
  const canToggleStatus = RbacService.can('LOCATIONS', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const [listLocations, { data, isLoading, error }] = useListLocationsMutation()

  useEffect(() => {
    listLocations({
      approvalState: ['APPROVED'],
      search: search || undefined,
      page,
      size: pageSize,
    })
  }, [search, page])

  const springPage = data?.data
  const locations = springPage?.content ?? []

  const [toggleActive] = useToggleLocationActiveMutation()

  const handleToggleActive = async (locationId: number, currentActive: boolean) => {
    try {
      await toggleActive({ locationId, active: !currentActive }).unwrap()
      toast.success('Location status updated.')
      listLocations({
        approvalState: ['APPROVED'],
        search: search || undefined,
        page,
        size: pageSize,
      })
    } catch {
      toast.error('Failed to update location status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load locations." onRetry={() => listLocations({
    approvalState: ['APPROVED'],
    search: search || undefined,
    page,
    size: pageSize,
  })} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Locations</h4>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate('/locations/create')}>
            <BsPlusCircle className="me-2" />Create Location
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
          {locations.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>City</th><th>Status</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>{locations.map(l => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.city ?? '—'}</td>
                    <td><StatusBadge status={l.state.toLowerCase()} /></td>
                    <td><Badge bg={l.active ? 'success' : 'secondary'}>{l.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/locations/${l.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/locations/${l.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={l.active ? 'outline-danger' : 'outline-success'} title={l.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(l.id, l.active)}>{l.active ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
