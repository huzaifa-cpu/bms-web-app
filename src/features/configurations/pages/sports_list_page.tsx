import { useEffect } from 'react'
import { Card, Table, Button, Badge, Spinner, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsPlus, BsPencil } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import RbacService from '../../../core/services/rbac_service'
import { ROUTES } from '../../../core/constants/routes'
import { useListSportsMutation, useToggleSportStatusMutation } from '../api/sports_api'

export default function SportsListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('CONFIGURATIONS_SPORTS', 'CREATE')
  const canUpdate = RbacService.can('CONFIGURATIONS_SPORTS', 'UPDATE')
  const canToggle = RbacService.can('CONFIGURATIONS_SPORTS', 'ACTIVE_INACTIVE')

  const [listSports, { data, isLoading, isError }] = useListSportsMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleSportStatusMutation()

  useEffect(() => {
    listSports()
  }, [])

  const sports = data?.data ?? []

  const handleToggleStatus = async (sportId: number, currentActive: boolean) => {
    try {
      await toggleStatus({ sportId, active: !currentActive }).unwrap()
      toast.success(`Sport ${!currentActive ? 'activated' : 'deactivated'} successfully.`)
      listSports()
    } catch (err: unknown) {
      const e = err as { data?: { errorMessage?: string } }
      toast.error(e?.data?.errorMessage || 'Failed to update sport status.')
    }
  }


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Sports</h4>
        {canCreate && (
          <Button variant="primary" onClick={() => navigate(ROUTES.CONFIGURATIONS_SPORT_NEW)}>
            <BsPlus className="me-1" /> Add Sport
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : isError ? (
            <div className="text-center py-4 text-muted">Failed to load sports.</div>
          ) : sports.length === 0 ? (
            <EmptyState title="No sports found" />
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Image</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sports.map(sport => (
                  <tr key={sport.id}>
                    <td>
                      {sport.imageUrl ? (
                        <img
                          src={sport.imageUrl}
                          alt={sport.name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: 'var(--color-bg-page)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span className="text-muted small">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="align-middle fw-medium">{sport.name}</td>
                    <td className="align-middle">
                      {canToggle ? (
                        <Form.Check
                          type="switch"
                          checked={sport.active}
                          onChange={() => handleToggleStatus(sport.id, sport.active)}
                          disabled={isToggling}
                          label={sport.active ? 'Active' : 'Inactive'}
                        />
                      ) : (
                        <Badge bg={sport.active ? 'success' : 'secondary'}>
                          {sport.active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex gap-1">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(ROUTES.CONFIGURATIONS_SPORT_EDIT.replace(':sportId', String(sport.id)))}
                          >
                            <BsPencil />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

