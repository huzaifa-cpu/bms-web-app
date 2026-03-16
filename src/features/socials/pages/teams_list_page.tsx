import { useState } from 'react'
import { Card, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsPlusCircle, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Pagination } from '../../../core/ui/components/pagination'
import RbacService from '../../../core/services/rbac_service'
import { useListTeamsQuery, useToggleTeamActiveMutation } from '../api/socials_api'

export default function TeamsListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('TEAMS', 'CREATE')
  const canEdit = RbacService.can('TEAMS', 'UPDATE')
  const canToggleStatus = RbacService.can('TEAMS', 'UPDATE')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const activeParam = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined

  const { data, isLoading, error } = useListTeamsQuery({
    active: activeParam,
    page: page - 1,
    size: pageSize,
  })
  const [toggleActive] = useToggleTeamActiveMutation()

  const springPage = data?.data
  const teams = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const handleToggle = async (teamId: number, currentActive: boolean) => {
    try {
      await toggleActive({ teamId, active: !currentActive }).unwrap()
      toast.success('Team status updated.')
    } catch {
      toast.error('Failed to update team status.')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load teams." />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Teams</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/socials/teams/new')}>
            <BsPlusCircle className="me-2" />Create Team
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
          {teams.length === 0 ? <EmptyState title="No teams found" /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>{teams.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.description ? (t.description.length > 60 ? t.description.substring(0, 60) + '...' : t.description) : '-'}</td>
                    <td><Badge bg={t.active ? 'success' : 'secondary'}>{t.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td>{new Date(t.createdOn).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/socials/teams/${t.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={t.active ? 'outline-danger' : 'outline-success'} title={t.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(t.id, t.active)}>{t.active ? <BsToggleOn /> : <BsToggleOff />}</Button>}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </Table>
              <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
