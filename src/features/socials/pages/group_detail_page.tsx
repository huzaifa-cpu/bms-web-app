import { Card, Row, Col, Badge, Button, ListGroup } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { BsPencil, BsCalendar, BsPersonFill, BsShieldFill } from 'react-icons/bs'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import RbacService from '../../../core/services/rbac_service'
import { useGetGroupQuery } from '../api/socials_api'

export default function GroupDetailPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const canEdit = RbacService.can('GROUPS', 'UPDATE')

  const { data, isLoading, error, refetch } = useGetGroupQuery(Number(groupId))
  const group = data?.data

  if (isLoading) return <Loader />
  if (error || !group) return <ErrorState error="Group not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Group Details</h4>
        {canEdit && (
          <Button variant="outline-primary" size="sm" onClick={() => navigate(`/socials/groups/${groupId}/edit`)}>
            <BsPencil className="me-2" />Edit
          </Button>
        )}
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Group Information</Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt="Group Avatar" className="rounded-circle" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto" style={{ width: 100, height: 100 }}>
                    <span className="text-white display-5">{group.name[0].toUpperCase()}</span>
                  </div>
                )}
                <h5 className="mt-3 mb-1">{group.name}</h5>
                <Badge bg={group.active ? 'success' : 'secondary'}>{group.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <Row className="g-3">
                <Col xs={6}>
                  <small className="text-muted d-block">Sport</small>
                  <span className="fw-semibold">{group.sportName ?? '-'}</span>
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Join Policy</small>
                  <span className="fw-semibold">{group.joinPolicy ?? '-'}</span>
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Created</small>
                  <span className="fw-semibold"><BsCalendar className="me-1" />{new Date(group.createdOn).toLocaleDateString()}</span>
                </Col>
                <Col xs={6}>
                  <small className="text-muted d-block">Members</small>
                  <span className="fw-semibold"><BsPersonFill className="me-1" />{group.members?.length ?? 0}</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold">Description</Card.Header>
            <Card.Body>
              <p className="mb-0">{group.description || 'No description provided.'}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Members List */}
        {group.members && group.members.length > 0 && (
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold">Members ({group.members.length})</Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {group.members.map(m => (
                    <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                          <span className="text-white small">{(m.userName ?? 'U')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="fw-semibold">{m.userName ?? 'Unknown'}</div>
                          <small className="text-muted">{m.userPhone ?? '-'}</small>
                        </div>
                      </div>
                      <div>
                        {m.role === 'ADMIN' && <Badge bg="warning" text="dark"><BsShieldFill className="me-1" />Admin</Badge>}
                        {m.role === 'MEMBER' && <Badge bg="secondary">Member</Badge>}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}
