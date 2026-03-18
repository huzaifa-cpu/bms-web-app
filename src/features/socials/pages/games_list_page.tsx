import { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsEye, BsPlusCircle, BsPencil, BsXCircle, BsCalendarCheck } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Pagination } from '../../../core/ui/components/pagination'
import RbacService from '../../../core/services/rbac_service'
import { useListGamesMutation, useCancelGameMutation } from '../api/socials_api'

export default function GamesListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('GAMES', 'CREATE')
  const canEdit = RbacService.can('GAMES', 'UPDATE')
  const canCancel = RbacService.can('GAMES', 'ACTIVE_INACTIVE')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 20

  const [listGames, { data, isLoading, error }] = useListGamesMutation()

  const [cancelGame, { isLoading: isCancelling }] = useCancelGameMutation()

  useEffect(() => {
    listGames({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: page - 1,
      size: pageSize,
    })
  }, [statusFilter, page, pageSize])

  const handleCancelGame = async (gameId: number) => {
    try {
      await cancelGame(gameId).unwrap()
      toast.success('Game cancelled.')
      listGames({ status: statusFilter !== 'all' ? statusFilter : undefined, page: page - 1, size: pageSize })
    } catch {
      toast.error('Failed to cancel game.')
    }
  }

  const springPage = data?.data
  const games = springPage?.content ?? []
  const totalItems = springPage?.totalElements ?? 0
  const totalPages = springPage?.totalPages ?? 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Badge bg="primary">Scheduled</Badge>
      case 'ACTIVE': return <Badge bg="info">Active</Badge>
      case 'COMPLETED': return <Badge bg="success">Completed</Badge>
      case 'CANCELED': return <Badge bg="danger">Cancelled</Badge>
      case 'DRAFT': return <Badge bg="secondary">Draft</Badge>
      default: return <Badge bg="secondary">{status}</Badge>
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorState error="Failed to load games." />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Games</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/socials/games/new')}>
            <BsPlusCircle className="me-2" />Create Game
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Cancelled</option>
              </Form.Select>
            </Col>
          </Row>
          {games.length === 0 ? <EmptyState title="No games found" /> : (
            <>
              <Table hover responsive>
                <thead><tr><th>Title</th><th>Sport</th><th>Date</th><th>City</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>{games.map(g => (
                  <tr key={g.id}>
                    <td>{g.title}</td>
                    <td>{g.sportName ?? '-'}</td>
                    <td>{g.gameDate ?? '-'}</td>
                    <td>{g.city ?? '-'}</td>
                    <td>{getStatusBadge(g.status)}</td>
                    <td>{new Date(g.createdOn).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/socials/games/${g.id}`)}><BsEye /></Button>
                        {canEdit && g.status !== 'CANCELED' && g.status !== 'COMPLETED' && (
                          <Button size="sm" variant="primary" title="Edit" onClick={() => navigate(`/socials/games/${g.id}/edit`)}><BsPencil /></Button>
                        )}
                        {canCancel && g.status !== 'CANCELED' && g.status !== 'COMPLETED' && (
                          <Button size="sm" variant="outline-danger" title="Cancel" onClick={() => handleCancelGame(g.id)} disabled={isCancelling}><BsXCircle /></Button>
                        )}
                        {canEdit && g.status === 'CANCELED' && (
                          <Button size="sm" variant="success" title="Reschedule" onClick={() => navigate(`/socials/games/${g.id}/reschedule`)}><BsCalendarCheck /></Button>
                        )}
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
