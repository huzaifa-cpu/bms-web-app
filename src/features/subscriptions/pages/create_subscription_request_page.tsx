import { useState, useEffect, useRef } from 'react'
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsArrowLeft, BsChevronDown, BsCheck2 } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../../core/constants/routes'
import { useListProvidersMutation } from '../../providers/api/providers_api'
import { useListPlansMutation, useCreateSubscriptionRequestMutation } from '../api/subscriptions_api'
import type { PlanConfigDto } from '../api/subscriptions_types'

export default function CreateSubscriptionRequestPage() {
  const navigate = useNavigate()

  // Provider search
  const [providerSearch, setProviderSearch] = useState('')
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const [selectedProviderName, setSelectedProviderName] = useState('')
  const providerDropdownRef = useRef<HTMLDivElement>(null)

  // Plan selection
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)

  // Notes
  const [adminNotes, setAdminNotes] = useState('')

  // API mutations
  const [listProviders, { data: providersData, isLoading: isLoadingProviders }] = useListProvidersMutation()
  const [listPlans, { data: plansData, isLoading: isLoadingPlans }] = useListPlansMutation()
  const [createRequest, { isLoading: isSubmitting }] = useCreateSubscriptionRequestMutation()

  useEffect(() => {
    listProviders({
      search: providerSearch,
      page: 0,
      size: 10,
      approvalStates: ['APPROVED'],
    })
  }, [providerSearch])

  useEffect(() => {
    listPlans()
  }, [])

  const providers = providersData?.data?.content ?? []
  const plans: PlanConfigDto[] = plansData?.data?.filter(p => p.active) ?? []

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isFormValid = () => {
    return selectedProviderId !== null && selectedPlanId !== null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      toast.error('Please select a provider and a plan.')
      return
    }

    try {
      await createRequest({
        providerUserId: selectedProviderId!,
        planConfigId: selectedPlanId!,
        adminNotes: adminNotes || undefined,
      }).unwrap()
      toast.success('Subscription request created successfully.')
      navigate(ROUTES.SUBSCRIPTION_REQUESTS)
    } catch (err: unknown) {
      const e = err as { data?: { errorMessage?: string } }
      toast.error(e?.data?.errorMessage || 'Failed to create subscription request.')
    }
  }

  const formatPrice = (plan: PlanConfigDto) => {
    if (plan.planType === 'PERIOD_BASED' && plan.periodPrice) {
      return `Rs. ${plan.periodPrice.toLocaleString()} / ${plan.billingPeriod?.toLowerCase() || 'period'}`
    }
    if (plan.planType === 'COMMISSION_BASED' && plan.commissionPercentage) {
      return `${plan.commissionPercentage}% commission`
    }
    return 'N/A'
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Create Subscription Request</h4>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Provider Selection */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Provider <span className="text-danger">*</span></Form.Label>
                  <div ref={providerDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        placeholder="Search provider..."
                        value={selectedProviderId ? selectedProviderName : providerSearch}
                        onChange={(e) => {
                          setProviderSearch(e.target.value)
                          setSelectedProviderName('')
                          setSelectedProviderId(null)
                          setShowProviderDropdown(true)
                        }}
                        onFocus={() => setShowProviderDropdown(true)}
                      />
                      <InputGroup.Text style={{ cursor: 'pointer' }} onClick={() => setShowProviderDropdown(!showProviderDropdown)}>
                        <BsChevronDown />
                      </InputGroup.Text>
                    </InputGroup>
                    {showProviderDropdown && (
                      <div
                        className="position-absolute w-100 border rounded shadow-sm mt-1"
                        style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {isLoadingProviders ? (
                          <div className="p-2 text-center"><Spinner size="sm" /></div>
                        ) : providers.length === 0 ? (
                          <div className="p-2 text-muted text-center">No providers found</div>
                        ) : (
                          providers.map((p) => (
                            <div
                              key={p.id}
                              className={`p-2 ${selectedProviderId === p.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedProviderId(p.id)
                                setSelectedProviderName(p.name || p.businessName || `Provider #${p.id}`)
                                setShowProviderDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (selectedProviderId !== p.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (selectedProviderId !== p.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{p.name || p.businessName || 'N/A'}</div>
                              <small style={{ color: selectedProviderId === p.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {p.email ?? `ID: ${p.id}`}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Admin Notes */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Admin Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder="Add notes..."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Plan Selection */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Select Subscription Plan <span className="text-danger">*</span></Form.Label>
                  {isLoadingPlans ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : plans.length === 0 ? (
                    <div className="text-muted py-3">No active plans available.</div>
                  ) : (
                    <Row className="g-3">
                      {plans.map(plan => (
                        <Col md={6} lg={4} key={plan.id}>
                          <Card
                            className={`h-100 ${selectedPlanId === plan.id ? 'border-primary border-2' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Form.Check
                                  type="radio"
                                  name="planSelection"
                                  id={`plan-${plan.id}`}
                                  checked={selectedPlanId === plan.id}
                                  onChange={() => setSelectedPlanId(plan.id)}
                                  label=""
                                />
                                {selectedPlanId === plan.id && (
                                  <BsCheck2 className="text-primary fs-4" />
                                )}
                              </div>
                              <h6 className="fw-bold mb-1">{plan.name}</h6>
                              <div className="text-primary fw-bold mb-2">{formatPrice(plan)}</div>
                              <small className="text-muted d-block mb-2">
                                {plan.description || 'No description'}
                              </small>
                              <div className="small">
                                <div>📍 Max Locations: {plan.maxLocations}</div>
                                <div>🏟️ Max Facilities/Location: {plan.maxFacilitiesPerLocation}</div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col xs={12} className="mt-4">
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        Creating...
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(ROUTES.SUBSCRIPTION_REQUESTS)}>
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
