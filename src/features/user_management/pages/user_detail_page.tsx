import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { BsArrowLeft } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetUserQuery } from '../api/users_api'

export default function UserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useGetUserQuery(Number(userId))
  const user = data?.data

  if (isLoading) return <Loader fullPage />
  if (error || !user) return <ErrorState error="User not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/users')}><BsArrowLeft className="me-1" />Back</Button>
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="text-white fs-5">{user.name[0].toUpperCase()}</span>
          }
        </div>
        <h4 className="fw-bold mb-0">{user.name}</h4>
        <Badge bg={user.status === 'ACTIVE' ? 'success' : 'secondary'}>{user.status}</Badge>
      </div>
      <Card className="shadow-sm">
        <Card.Header><strong>User Details</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Name</small><p>{user.name}</p></Col>
            <Col sm={6}><small className="text-muted">Email</small><p>{user.email}</p></Col>
            <Col sm={6}><small className="text-muted">Phone</small><p>{user.mobileNumber ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Role</small><p>{user.roleName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Role Type</small><p>{user.roleType ?? '—'}</p></Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
