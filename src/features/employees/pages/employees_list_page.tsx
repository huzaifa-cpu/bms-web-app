import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListEmployeesMutation, useToggleEmployeeStatusMutation } from '../api/employees_api'
import RbacService from '../../../core/services/rbac_service'

export default function EmployeesListPage() {
  const navigate = useNavigate()
  const canEdit = RbacService.can('EMPLOYEES', 'UPDATE')
  const canToggleStatus = RbacService.can('EMPLOYEES', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const [listEmployees, { data, isLoading, error }] = useListEmployeesMutation()
  const springPage = data?.data
  const employees = springPage?.content ?? []

  useEffect(() => {
    listEmployees({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: search || undefined,
      page,
      size: pageSize,
    })
  }, [statusFilter, search, page])

  const [toggleStatus] = useToggleEmployeeStatusMutation()

  const handleToggleStatus = async (employeeId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await toggleStatus({ employeeId, status: newStatus }).unwrap()
      toast.success('Employee status updated.')
      listEmployees({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        page,
        size: pageSize,
      })
    } catch {
      toast.error('Failed to update employee status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load employees." onRetry={() => listEmployees({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    page,
    size: pageSize,
  })} />

  return (
    <div>
      <h4 className="fw-bold mb-4">Employees</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search employees..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
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
          {employees.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Job Title</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{employees.map(e => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td>{e.mobileNumber}</td>
                    <td>{e.jobTitle ?? '—'}</td>
                    <td><Badge bg={e.status === 'ACTIVE' ? 'success' : 'secondary'}>{e.status}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/employees/${e.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/employees/${e.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={e.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'} title={e.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(e.id, e.status)}>{e.status === 'ACTIVE' ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
