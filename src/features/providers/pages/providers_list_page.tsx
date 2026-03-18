import { useState, useEffect } from 'react'
import { Card, Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListProvidersMutation, useToggleProviderStatusMutation } from '../api/providers_api'
import RbacService from '../../../core/services/rbac_service'

export default function ProvidersListPage() {
  const navigate = useNavigate()
  const canEdit = RbacService.can('PROVIDERS', 'UPDATE')
  const canToggleStatus = RbacService.can('PROVIDERS', 'ACTIVE_INACTIVE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const [listProviders, { data, isLoading, error }] = useListProvidersMutation()

  useEffect(() => {
    listProviders({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      approvalStates: ['APPROVED'],
      search: search || undefined,
      page,
      size: pageSize,
    })
  }, [statusFilter, search, page])

  const springPage = data?.data
  const providers = springPage?.content ?? []

  const [toggleStatus] = useToggleProviderStatusMutation()

  const handleToggleStatus = async (providerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await toggleStatus({ providerId, status: newStatus }).unwrap()
      toast.success('Provider status updated.')
      listProviders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        approvalStates: ['APPROVED'],
        search: search || undefined,
        page,
        size: pageSize,
      })
    } catch {
      toast.error('Failed to update provider status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load providers." onRetry={() => listProviders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    approvalStates: ['APPROVED'],
    search: search || undefined,
    page,
    size: pageSize,
  })} />

  return (
    <div>
      <h4 className="fw-bold mb-4">Providers</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search providers..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
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
          {providers.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Name</th><th>Business</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{providers.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.businessName ?? '—'}</td>
                    <td>{p.email}</td>
                    <td>{p.mobileNumber}</td>
                    <td><span className={`badge bg-${p.status === 'ACTIVE' ? 'success' : 'secondary'}`}>{p.status}</span></td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/providers/${p.id}`)}><BsEye /></Button>
                        {canEdit && <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/providers/${p.id}/edit`)}><BsPencil /></Button>}
                        {canToggleStatus && <Button size="sm" variant={p.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'} title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} onClick={() => handleToggleStatus(p.id, p.status)}>{p.status === 'ACTIVE' ? <BsToggleOn /> : <BsToggleOff />}</Button>}
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
