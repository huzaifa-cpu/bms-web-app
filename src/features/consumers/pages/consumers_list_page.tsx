import { useState, useEffect } from 'react'
import { Card, Table, Badge, Form, InputGroup, Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListConsumersMutation, useToggleConsumerStatusMutation } from '../api/consumers_api'
import RbacService from '../../../core/services/rbac_service'

export default function ConsumersListPage() {
  const navigate = useNavigate()
  const canEdit = RbacService.can('CONSUMERS', 'UPDATE')
  const canToggleStatus = RbacService.can('CONSUMERS', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const [listConsumers, { data, isLoading, error }] = useListConsumersMutation()
  const springPage = data?.data
  const consumers = springPage?.content ?? []

  useEffect(() => {
    listConsumers({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: search || undefined,
      page,
      size: pageSize,
    })
  }, [search, page, statusFilter])

  const refetch = () => listConsumers({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    page,
    size: pageSize,
  })

  const [toggleStatus] = useToggleConsumerStatusMutation()

  const handleToggleStatus = async (consumerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await toggleStatus({ consumerId, status: newStatus }).unwrap()
      toast.success('Consumer status updated.')
      refetch()
    } catch {
      toast.error('Failed to update consumer status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load consumers." onRetry={refetch} />

  return (
    <div>
      <h4 className="fw-bold mb-4">Consumers</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search consumers..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
          {consumers.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{consumers.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.mobileNumber}</td>
                    <td>{c.city ?? '—'}</td>
                    <td><Badge bg={c.status === 'ACTIVE' ? 'success' : 'secondary'}>{c.status}</Badge></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/consumers/${c.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/consumers/${c.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={c.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'} title={c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(c.id, c.status)}>{c.status === 'ACTIVE' ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
