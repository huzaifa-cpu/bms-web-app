import { useState, useEffect } from 'react'
import { Card, Table, Badge, Form, Row, Col, Button, Spinner } from 'react-bootstrap'
import { BsEye } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { useListNotificationHistoryMutation } from '../api/notifications_api'
import type { NotificationStatus, NotificationChannel } from '../api/notifications_types'

const STATUS_OPTIONS: NotificationStatus[] = ['QUEUED', 'SENT', 'FAILED', 'CANCELED']
const CHANNEL_OPTIONS: NotificationChannel[] = ['IN_APP', 'SMS', 'EMAIL', 'PUSH']

const statusBadge = (status: string) => {
  switch (status) {
    case 'SENT': return 'success'
    case 'QUEUED': return 'warning'
    case 'FAILED': return 'danger'
    case 'CANCELED': return 'secondary'
    default: return 'secondary'
  }
}

export default function NotificationsHistoryPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [channelFilter, setChannelFilter] = useState<string>('')
  const pageSize = 10

  const [listNotificationHistory, { data, isLoading, isError }] = useListNotificationHistoryMutation()

  useEffect(() => {
    listNotificationHistory({
      status: statusFilter ? statusFilter as NotificationStatus : undefined,
      channel: channelFilter ? channelFilter as NotificationChannel : undefined,
      page: page - 1,
      size: pageSize,
    })
  }, [statusFilter, channelFilter, page])

  return (
    <div>
      <h4 className="fw-bold mb-4">Notification History</h4>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1) }}>
                <option value="">All Channels</option>
                {CHANNEL_OPTIONS.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : isError ? (
            <div className="text-center py-4 text-muted">Failed to load notification history.</div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState title="No notifications found" />
          ) : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(n => (
                    <tr key={n.id}>
                      <td>{n.title || '(No title)'}</td>
                      <td><Badge bg="info">{n.type}</Badge></td>
                      <td><Badge bg="secondary">{n.channel.replace('_', ' ')}</Badge></td>
                      <td><Badge bg={statusBadge(n.status)}>{n.status}</Badge></td>
                      <td>{n.sentAt ? new Date(n.sentAt).toLocaleString() : '-'}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/notifications/history/${n.id}`)}>
                          <BsEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                page={page}
                totalPages={data.totalPages}
                pageSize={pageSize}
                totalItems={data.totalElements}
                onPageChange={setPage}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
