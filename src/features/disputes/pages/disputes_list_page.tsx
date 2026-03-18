import { useState, useEffect } from 'react'
import { Card, Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPlus } from 'react-icons/bs'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useListDisputesMutation } from '../api/disputes_api'
import type { DisputeDto } from '../api/disputes_types'
import { formatDate } from '../../../core/utils/date_utils'
import { ROUTES } from '../../../core/constants/routes'
import RbacService from '../../../core/services/rbac_service'

export default function DisputesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 10

  const [listDisputes, { data, isLoading, error }] = useListDisputesMutation()

  useEffect(() => {
    const queryParams = statusFilter !== 'all' ? { status: statusFilter } : undefined
    listDisputes(queryParams)
  }, [statusFilter])

  const refetch = () => {
    const queryParams = statusFilter !== 'all' ? { status: statusFilter } : undefined
    listDisputes(queryParams)
  }

  const disputes = data?.data ?? []

  const canCreate = RbacService.can('DISPUTES', 'CREATE')

  const filtered = disputes.filter((d: DisputeDto) => {
    const matchesSearch = d.subject?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load disputes." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Disputes</h4>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate(ROUTES.DISPUTE_CREATE)}>
            <BsPlus className="me-1" />Create Dispute
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search disputes..." value={search} onChange={e => setSearch(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </Form.Select>
            </Col>
          </Row>
          {paginated.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>ID</th><th>Subject</th><th>Type</th><th>Status</th><th>Opened</th><th>Actions</th></tr></thead>
                <tbody>{paginated.map((d: DisputeDto) => (
                  <tr key={d.id}>
                    <td>#{d.id}</td>
                    <td>{d.subject}</td>
                    <td>{d.type}</td>
                    <td><StatusBadge status={d.status.toLowerCase()} /></td>
                    <td>{formatDate(d.openedAt)}</td>
                    <td><Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/disputes/${d.id}`)}><BsEye /></Button></td>
                  </tr>
                ))}</tbody>
              </Table>
              <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
