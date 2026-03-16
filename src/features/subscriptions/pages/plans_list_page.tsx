import { Card, Table, Button, Badge } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsPlusCircle, BsPencil, BsToggleOn, BsToggleOff } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import RbacService from '../../../core/services/rbac_service'
import { useListPlansQuery, useTogglePlanActiveMutation } from '../api/subscriptions_api'
import type { PlanConfigDto } from '../api/subscriptions_types'

const formatPricing = (plan: PlanConfigDto): string => {
  if (plan.planType === 'PERIOD_BASED') {
    const price = plan.periodPrice?.toLocaleString() ?? '0'
    const period = plan.billingPeriod?.toLowerCase() ?? ''
    return `PKR ${price}/${period}`
  } else if (plan.planType === 'COMMISSION_BASED') {
    return `${plan.commissionPercentage ?? 0}% per booking`
  }
  return '-'
}

const formatPlanType = (planType: string): JSX.Element => {
  if (planType === 'PERIOD_BASED') {
    return <Badge bg="info">Period Based</Badge>
  } else if (planType === 'COMMISSION_BASED') {
    return <Badge bg="warning" text="dark">Commission Based</Badge>
  }
  return <Badge bg="secondary">{planType}</Badge>
}

export default function PlansListPage() {
  const navigate = useNavigate()
  const canCreate = RbacService.can('SUBSCRIPTIONS_PLANS', 'CREATE')
  const canEdit = RbacService.can('SUBSCRIPTIONS_PLANS', 'UPDATE')
  const canToggle = RbacService.can('SUBSCRIPTIONS_PLANS', 'ACTIVE_INACTIVE')

  const { data, isLoading, error, refetch } = useListPlansQuery()
  const plans = data?.data ?? []

  const [toggleActive] = useTogglePlanActiveMutation()

  const handleToggleActive = async (planId: number, currentActive: boolean) => {
    try {
      await toggleActive({ planId, active: !currentActive }).unwrap()
      toast.success('Plan status updated.')
    } catch {
      toast.error('Failed to update plan status.')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load plans." onRetry={refetch} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Subscription Plans</h4>
        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => navigate('/subscriptions/plans/new')}>
            <BsPlusCircle className="me-2" />New Plan
          </Button>
        )}
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          {plans.length === 0 ? <EmptyState title="No subscription plans" description="Create your first plan to get started." /> : (
            <Table hover responsive>
              <thead><tr><th>Name</th><th>Type</th><th>Pricing</th><th>Locations</th><th>Facilities/Loc</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{plans.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="fw-semibold">{p.name}</div>
                    {p.description && <small className="text-muted">{p.description.substring(0, 50)}{p.description.length > 50 ? '...' : ''}</small>}
                  </td>
                  <td>{formatPlanType(p.planType)}</td>
                  <td>{formatPricing(p)}</td>
                  <td>{p.maxLocations >= 999 ? 'Unlimited' : p.maxLocations}</td>
                  <td>{p.maxFacilitiesPerLocation >= 999 ? 'Unlimited' : p.maxFacilitiesPerLocation}</td>
                  <td><Badge bg={p.active ? 'success' : 'secondary'}>{p.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td>
                    <div className="d-flex gap-1">
                      {canEdit && <Button size="sm" variant="outline-primary" onClick={() => navigate(`/subscriptions/plans/${p.id}/edit`)}><BsPencil /></Button>}
                      {canToggle && <Button size="sm" variant={p.active ? 'outline-danger' : 'outline-success'} onClick={() => handleToggleActive(p.id, p.active)}>{p.active ? <BsToggleOn /> : <BsToggleOff />}</Button>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
