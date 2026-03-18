import { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap'
import { BsPlusCircle, BsPencil, BsToggleOn, BsToggleOff, BsEye } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Pagination } from '../../../core/ui/components/pagination'
import RbacService from '../../../core/services/rbac_service'
import { useListGroupsMutation, useToggleGroupActiveMutation } from '../api/socials_api'

export default function GroupsListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('GROUPS', 'CREATE')
  const canEdit = RbacService.can('GROUPS', 'UPDATE')
  const canToggleStatus = RbacService.can('GROUPS', 'ACTIVE_INACTIVE')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const activeParam = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined

  const [listGroups, { data, isLoading, error }] = useListGroupsMutation()
  const [toggleActive] = useToggleGroupActiveMutation()

  useEffect(() => {
    listGroups({
      active: activeParam,
      page: page - 1,
      size: pageSize,
    })
  }, [activeParam, page, pageSize])

  const springPage = data?.data
  const groups = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const handleToggle = async (groupId: number, currentActive: boolean) => {
    try {
      await toggleActive({ groupId, active: !currentActive }).unwrap()
      toast.success(`Group ${!currentActive ? 'activated' : 'deactivated'} successfully.`)
      listGroups({ active: activeParam, page: page - 1, size: pageSize })
    } catch {
      toast.error('Failed to update group status.')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load groups." />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Groups</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/socials/groups/new')}>
            <BsPlusCircle className="me-2" />Create Group
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
          {groups.length === 0 ? <EmptyState title="No groups found" /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Description</th><th>Join Policy</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>{groups.map(g => (
                  <tr key={g.id}>
                    <td>{g.name}</td>
                    <td>{g.description ? (g.description.length > 60 ? g.description.substring(0, 60) + '...' : g.description) : '-'}</td>
                    <td>{g.joinPolicy ?? '-'}</td>
                    <td><Badge bg={g.active ? 'success' : 'secondary'}>{g.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td>{new Date(g.createdOn).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/socials/groups/${g.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/socials/groups/${g.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={g.active ? 'outline-danger' : 'outline-success'} title={g.active ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(g.id, g.active)}>{g.active ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
