import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { useGetPlanQuery, useCreatePlanMutation, useUpdatePlanMutation, useGetPlanMetadataQuery } from '../api/subscriptions_api'
import type { PlanType, BillingPeriod } from '../api/subscriptions_types'

const baseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  planType: z.string().min(1, 'Plan type is required'),
  // Period-based fields
  billingPeriod: z.string().optional(),
  periodPrice: z.coerce.number().min(0).optional(),
  // Commission-based fields
  commissionPercentage: z.coerce.number().min(0).max(100).optional(),
  minCommissionAmount: z.coerce.number().min(0).optional(),
  maxCommissionAmount: z.coerce.number().min(0).optional(),
  // Common fields
  maxLocations: z.coerce.number().min(1, 'Must be at least 1'),
  maxFacilitiesPerLocation: z.coerce.number().min(1, 'Must be at least 1'),
})

type FormData = z.infer<typeof baseSchema>

const schema = baseSchema.refine((data) => {
  if (data.planType === 'PERIOD_BASED') {
    return data.billingPeriod && data.periodPrice !== undefined && data.periodPrice > 0
  }
  return true
}, { message: 'Billing period and price are required for period-based plans', path: ['periodPrice'] })
.refine((data) => {
  if (data.planType === 'COMMISSION_BASED') {
    return data.commissionPercentage !== undefined && data.commissionPercentage > 0
  }
  return true
}, { message: 'Commission percentage is required for commission-based plans', path: ['commissionPercentage'] })

export default function PlanFormPage() {
  const navigate = useNavigate()
  const { planId } = useParams()
  const isEdit = !!planId

  // Fetch metadata
  const { data: metadataData, isLoading: metadataLoading, error: metadataError } = useGetPlanMetadataQuery()
  const metadata = metadataData?.data

  const { data, isLoading, error } = useGetPlanQuery(Number(planId), { skip: !isEdit })
  const existing = data?.data

  const [createPlan] = useCreatePlanMutation()
  const [updatePlan] = useUpdatePlanMutation()

  const defaultPlanType = metadata?.planTypes?.[0]?.value ?? 'PERIOD_BASED'
  const defaultBillingPeriod = metadata?.billingPeriods?.[0]?.value ?? 'MONTHLY'

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    values: existing ? {
      name: existing.name,
      description: existing.description ?? '',
      planType: existing.planType,
      billingPeriod: existing.billingPeriod ?? defaultBillingPeriod,
      periodPrice: existing.periodPrice ?? 0,
      commissionPercentage: existing.commissionPercentage ?? 0,
      minCommissionAmount: existing.minCommissionAmount ?? 0,
      maxCommissionAmount: existing.maxCommissionAmount ?? 0,
      maxLocations: existing.maxLocations,
      maxFacilitiesPerLocation: existing.maxFacilitiesPerLocation,
    } : undefined,
    defaultValues: {
      name: '',
      description: '',
      planType: defaultPlanType,
      billingPeriod: defaultBillingPeriod,
      periodPrice: 0,
      commissionPercentage: 0,
      minCommissionAmount: 0,
      maxCommissionAmount: 0,
      maxLocations: 1,
      maxFacilitiesPerLocation: 5
    },
  })

  const planType = useWatch({ control, name: 'planType' })

  if (metadataLoading || (isEdit && isLoading)) return <Loader fullPage />
  if (metadataError) return <ErrorState error="Failed to load plan metadata." />
  if (isEdit && (error || !existing)) return <ErrorState error="Plan not found." />

  const onSubmit = async (formData: FormData) => {
    try {
      const request = {
        name: formData.name,
        description: formData.description,
        planType: formData.planType as PlanType,
        billingPeriod: formData.planType === 'PERIOD_BASED' ? formData.billingPeriod as BillingPeriod : undefined,
        periodPrice: formData.planType === 'PERIOD_BASED' ? formData.periodPrice : undefined,
        commissionPercentage: formData.planType === 'COMMISSION_BASED' ? formData.commissionPercentage : undefined,
        minCommissionAmount: formData.planType === 'COMMISSION_BASED' ? formData.minCommissionAmount : undefined,
        maxCommissionAmount: formData.planType === 'COMMISSION_BASED' ? formData.maxCommissionAmount : undefined,
        maxLocations: formData.maxLocations,
        maxFacilitiesPerLocation: formData.maxFacilitiesPerLocation,
      }

      if (isEdit) {
        await updatePlan({ planId: Number(planId), request }).unwrap()
        toast.success('Plan updated.')
      } else {
        await createPlan(request).unwrap()
        toast.success('Plan created.')
      }
      navigate('/subscriptions/plans')
    } catch {
      toast.error(isEdit ? 'Failed to update plan.' : 'Failed to create plan.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">{isEdit ? `Edit Plan — ${existing?.name}` : 'New Subscription Plan'}</h4>
      <Card className="shadow-sm" style={{ maxWidth: 700 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Plan Name <span className="text-danger">*</span></Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} placeholder="e.g., Basic, Premium, Enterprise" />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} {...register('description')} placeholder="Plan description..." />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Plan Type <span className="text-danger">*</span></Form.Label>
              <div className="d-flex gap-3">
                {metadata?.planTypes.map((pt) => (
                  <Form.Check
                    key={pt.value}
                    type="radio"
                    id={`planType-${pt.value}`}
                    label={pt.displayName}
                    value={pt.value}
                    {...register('planType')}
                  />
                ))}
              </div>
            </Form.Group>

            {/* Period-based fields */}
            {planType === 'PERIOD_BASED' && (
              <Card className="mb-4 bg-body-tertiary">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Period Based Settings</h6>
                  <Row>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Period <span className="text-danger">*</span></Form.Label>
                        <Form.Select isInvalid={!!errors.billingPeriod} {...register('billingPeriod')}>
                          {metadata?.billingPeriods.map((bp) => (
                            <option key={bp.value} value={bp.value}>{bp.displayName}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.billingPeriod?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price (PKR) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          isInvalid={!!errors.periodPrice}
                          {...register('periodPrice')}
                          placeholder="e.g., 5000"
                        />
                        <Form.Control.Feedback type="invalid">{errors.periodPrice?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Commission-based fields */}
            {planType === 'COMMISSION_BASED' && (
              <Card className="mb-4 bg-body-tertiary">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Commission Based Settings</h6>
                  <Row>
                    <Col sm={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Commission % <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          isInvalid={!!errors.commissionPercentage}
                          {...register('commissionPercentage')}
                          placeholder="e.g., 10"
                        />
                        <Form.Control.Feedback type="invalid">{errors.commissionPercentage?.message}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Min Commission (PKR)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          {...register('minCommissionAmount')}
                          placeholder="e.g., 50"
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Commission (PKR)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          {...register('maxCommissionAmount')}
                          placeholder="e.g., 500"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <small className="text-muted">
                    Commission will be charged per booking. Min/Max limits are optional.
                  </small>
                </Card.Body>
              </Card>
            )}

            <h6 className="fw-bold mb-3">Limits</h6>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Locations <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" isInvalid={!!errors.maxLocations} {...register('maxLocations')} />
                  <Form.Control.Feedback type="invalid">{errors.maxLocations?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Facilities per Location <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" isInvalid={!!errors.maxFacilitiesPerLocation} {...register('maxFacilitiesPerLocation')} />
                  <Form.Control.Feedback type="invalid">{errors.maxFacilitiesPerLocation?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Plan'}</Button>
              <Button variant="secondary" onClick={() => navigate('/subscriptions/plans')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
