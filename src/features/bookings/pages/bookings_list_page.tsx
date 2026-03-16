import { useState } from 'react'
import { Card, Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsEye, BsPlusCircle } from 'react-icons/bs'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useListBookingsQuery } from '../api/bookings_api'
import type { BookingDto } from '../api/bookings_types'
import { formatDateTime } from '../../../core/utils/date_utils'
import { formatCurrency } from '../../../core/utils/number_utils'
import { ROUTES } from '../../../core/constants/routes'
import RbacService from '../../../core/services/rbac_service'

export default function BookingsListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('BOOKINGS', 'CREATE')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const pageSize = 10

  const queryParams = statusFilter !== 'all' ? { status: statusFilter } : undefined
  const { data, isLoading, error, refetch } = useListBookingsQuery(queryParams)
  const bookings = data?.data ?? []

  const filtered = bookings.filter((b: BookingDto) => {
    const matchesSearch = b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.consumerUserId).includes(search) ||
      String(b.facilityId).includes(search)
    const matchesPayment = paymentFilter === 'all' || b.paymentStatus?.toLowerCase() === paymentFilter
    return matchesSearch && matchesPayment
  })
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load bookings." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Bookings</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.BOOKING_CREATE)}>
            <BsPlusCircle className="me-2" />Create Booking
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control placeholder="Search by ref or ID..." value={search} onChange={e => setSearch(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Form.Select>
            </Col>
          </Row>
          {paginated.length === 0 ? <EmptyState /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Ref</th><th>Consumer ID</th><th>Facility ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                <tbody>{paginated.map((b: BookingDto) => (
                  <tr key={b.id}>
                    <td>{b.bookingRef ?? `#${b.id}`}</td>
                    <td>{b.consumerUserId}</td>
                    <td>{b.facilityId}</td>
                    <td>{formatDateTime(b.startTime ?? b.bookingDate)}</td>
                    <td>{formatCurrency(b.amount)}</td>
                    <td><StatusBadge status={b.status.toLowerCase()} /></td>
                    <td>{b.paymentStatus ? <StatusBadge status={b.paymentStatus.toLowerCase()} /> : '—'}</td>
                    <td><Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/bookings/${b.id}`)}><BsEye /></Button></td>
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
