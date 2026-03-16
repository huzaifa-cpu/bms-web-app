import { useState } from 'react'
import { Card, Table, Button, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPlusCircle, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListUsersQuery, useToggleUserStatusMutation } from '../api/users_api'
import RbacService from '../../../core/services/rbac_service'

export default function UsersListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('USERS', 'CREATE')
  const canEdit = RbacService.can('USERS', 'UPDATE')
  const canToggleStatus = RbacService.can('USERS', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const { data, isLoading, error, refetch } = useListUsersQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    page,
    size: pageSize,
  })
  const springPage = data?.data
  const users = springPage?.content ?? []

  const [toggleStatus] = useToggleUserStatusMutation()

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await toggleStatus({ userId, status: newStatus }).unwrap()
      toast.success('User status updated.')
    } catch {
      toast.error('Failed to update user status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load users." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Users</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/users/new')}>
            <BsPlusCircle className="me-2" />Add User
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </Form.Select>
            </Col>
          </Row>
          {users.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.roleName ?? '—'}</td>
                    <td><Badge bg={u.status === 'ACTIVE' ? 'success' : 'secondary'}>{u.status}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/users/${u.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/users/${u.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={u.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'} title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(u.id, u.status)}>{u.status === 'ACTIVE' ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
