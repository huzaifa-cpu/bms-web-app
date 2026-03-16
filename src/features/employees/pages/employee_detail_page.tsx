import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import { BsArrowLeft } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetEmployeeQuery } from '../api/employees_api'

export default function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useGetEmployeeQuery(Number(employeeId))
  const employee = data?.data

  if (isLoading) return <Loader fullPage />
  if (error || !employee) return <ErrorState error="Employee not found." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/employees')}><BsArrowLeft className="me-1" />Back</Button>
        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          {employee.avatarUrl
            ? <img src={employee.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span className="text-white fs-5">{employee.name[0].toUpperCase()}</span>
          }
        </div>
        <h4 className="fw-bold mb-0">{employee.name}</h4>
        <Badge bg={employee.status === 'ACTIVE' ? 'success' : 'secondary'}>{employee.status}</Badge>
      </div>
      <Card className="shadow-sm">
        <Card.Header><strong>Employee Details</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Name</small><p>{employee.name}</p></Col>
            <Col sm={6}><small className="text-muted">Email</small><p>{employee.email}</p></Col>
            <Col sm={6}><small className="text-muted">Phone</small><p>{employee.mobileNumber}</p></Col>
            <Col sm={6}><small className="text-muted">Job Title</small><p>{employee.jobTitle ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Can Operate Cash</small><p>{employee.canOperateCash ? 'Yes' : 'No'}</p></Col>
            <Col sm={6}><small className="text-muted">Provider</small><p>{employee.providerName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Location</small><p>{employee.locationName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Facility</small><p>{employee.facilityName ?? '—'}</p></Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}
