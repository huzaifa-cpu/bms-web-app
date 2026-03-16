import { Card, Row, Col, Badge, Button } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { BsArrowLeft, BsCalendar, BsClock, BsGeoAlt, BsPeople, BsTrophy, BsPersonFill } from 'react-icons/bs'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useGetGameQuery } from '../api/socials_api'

export default function GameDetailPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useGetGameQuery(Number(gameId))

  const game = data?.data


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <Badge bg="primary">Upcoming</Badge>
      case 'SCHEDULED': return <Badge bg="primary">Scheduled</Badge>
      case 'ACTIVE': return <Badge bg="info">Active</Badge>
      case 'COMPLETED': return <Badge bg="success">Completed</Badge>
      case 'CANCELED': return <Badge bg="danger">Cancelled</Badge>
      case 'DRAFT': return <Badge bg="secondary">Draft</Badge>
      default: return <Badge bg="secondary">{status}</Badge>
    }
  }

  if (isLoading) return <Loader />
  if (error || !game) return <ErrorState error="Game not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/socials/games')}>
          <BsArrowLeft />
        </Button>
        <h4 className="fw-bold mb-0">{game.title}</h4>
        {getStatusBadge(game.status)}
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-transparent">
              <h6 className="mb-0 fw-bold">Game Details</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsPersonFill />
                    <span>Organizer</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.organizerName ?? '-'}</p>
                  {game.organizerPhone && <small className="text-muted">{game.organizerPhone}</small>}
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsTrophy />
                    <span>Sport</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.sportName ?? '-'}</p>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsPeople />
                    <span>Game Format</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.gameFormat ?? '-'}</p>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsGeoAlt />
                    <span>Location</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.venueName ?? '-'}</p>
                  {game.city && <small className="text-muted">{game.city}</small>}
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsCalendar />
                    <span>Date</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.gameDate ?? '-'}</p>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsClock />
                    <span>Time</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.startTime}{game.endTime ? ` - ${game.endTime}` : ''}</p>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <BsPeople />
                    <span>Players</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.minPlayers ?? '?'} - {game.maxPlayers ?? '?'}</p>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <span>Visibility</span>
                  </div>
                  <p className="mb-0 fw-semibold">{game.visibility ?? '-'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {game.description && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-transparent">
                <h6 className="mb-0 fw-bold">Description</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{game.description}</p>
              </Card.Body>
            </Card>
          )}

          {game.rules && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-transparent">
                <h6 className="mb-0 fw-bold">Rules</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{game.rules}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent">
              <h6 className="mb-0 fw-bold">Meta</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">Join Policy</small>
                <span className="fw-semibold">{game.joinPolicy ?? '-'}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Created On</small>
                <span className="fw-semibold">{new Date(game.createdOn).toLocaleString()}</span>
              </div>
              <div>
                <small className="text-muted d-block">Last Updated</small>
                <span className="fw-semibold">{new Date(game.updatedOn).toLocaleString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
