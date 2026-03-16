import { useState } from 'react'
import { Card, Table, Button, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsPlusCircle, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListRolesQuery, useToggleRoleStatusMutation } from '../api/roles_api'
import RbacService from '../../../core/services/rbac_service'

export default function RolesListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('ROLES', 'CREATE')
  const canEdit = RbacService.can('ROLES', 'UPDATE')
  const canToggleStatus = RbacService.can('ROLES', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [roleTypeFilter, setRoleTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, error, refetch } = useListRolesQuery()
  const allRoles = data?.data ?? []

  const [toggleStatus] = useToggleRoleStatusMutation()

  const handleToggleStatus = async (roleId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await toggleStatus({ roleId, status: newStatus }).unwrap()
      toast.success('Role status updated.')
    } catch {
      toast.error('Failed to update role status.')
    }
  }

  const filtered = allRoles.filter(r => {
    const matchesSearch = !search || r.roleName.toLowerCase().includes(search.toLowerCase())
    const matchesRoleType = roleTypeFilter === 'all' || r.roleType === roleTypeFilter
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesRoleType && matchesStatus
  })

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load roles." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Roles</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/roles/new')}>
            <BsPlusCircle className="me-2" />New Role
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={roleTypeFilter} onChange={e => setRoleTypeFilter(e.target.value)}>
                <option value="all">All Role Types</option>
                <option value="CONSUMER">Consumer</option>
                <option value="PROVIDER">Provider</option>
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
          {filtered.length === 0 ? <EmptyState title="No roles found" /> : (
            <Table hover responsive>
              <thead><tr><th>Name</th><th>Role Type</th><th>Status</th><th>Permissions</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.roleName}</td>
                  <td><Badge bg="info">{r.roleType}</Badge></td>
                  <td><Badge bg={r.status === 'ACTIVE' ? 'success' : 'secondary'}>{r.status}</Badge></td>
                  <td><Badge bg="secondary">{r.permissions.length} permissions</Badge></td>
                  <td>
                    <div className="d-flex gap-1">
                      {canEdit && (
                        <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/roles/${r.id}/edit`)}>
                          <BsPencil />
                        </Button>
                      )}
                      {canToggleStatus && (
                        <Button size="sm" variant={r.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'} title={r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(r.id, r.status)}>
                          {r.status === 'ACTIVE' ? <BsToggleOn /> : <BsToggleOff />}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
