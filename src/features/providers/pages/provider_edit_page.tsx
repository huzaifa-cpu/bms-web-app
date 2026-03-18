import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsTrash, BsUpload } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetProviderMutation, useUpdateProviderMutation } from '../api/providers_api'

import { useListPlansMutation } from '../../subscriptions/api/subscriptions_api'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  mobileNumber: z.string().min(1, 'Phone is required'),
  businessName: z.string().optional(),
  supportPhone: z.string().optional(),
  supportEmail: z.string().optional(),
  cnicNumber: z.string().optional(),
  cnicExpiry: z.string().optional(),
  planConfigId: z.number().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProviderEditPage() {
  const { providerId } = useParams()
  const navigate = useNavigate()

  const [getProvider, { data, isLoading, error }] = useGetProviderMutation()
  const provider = data?.data
  const [updateProvider, { isLoading: isSaving }] = useUpdateProviderMutation()

  // Fetch active plans
  const [listPlans, { data: plansData, isLoading: plansLoading }] = useListPlansMutation()
  const activePlans = (plansData?.data ?? []).filter(p => p.active)

  useEffect(() => {
    getProvider(Number(providerId))
    listPlans(undefined)
  }, [providerId])

  // CNIC image states
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null)
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null)
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null)
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null)
  const [deleteCnicFront, setDeleteCnicFront] = useState(false)
  const [deleteCnicBack, setDeleteCnicBack] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      mobileNumber: '',
      businessName: '',
      supportPhone: '',
      supportEmail: '',
      cnicNumber: '',
      cnicExpiry: '',
      planConfigId: undefined,
    },
  })

  useEffect(() => {
    if (provider) {
      reset({
        name: provider.name,
        email: provider.email,
        mobileNumber: provider.mobileNumber,
        businessName: provider.businessName ?? '',
        supportPhone: provider.supportPhone ?? '',
        supportEmail: provider.supportEmail ?? '',
        cnicNumber: provider.cnicNumber ?? '',
        cnicExpiry: provider.cnicExpiry ? provider.cnicExpiry.split('T')[0] : '',
        planConfigId: provider.planConfigId ?? undefined,
      })
      setCnicFrontPreview(provider.cnicFrontUrl)
      setCnicBackPreview(provider.cnicBackUrl)
      setDeleteCnicFront(false)
      setDeleteCnicBack(false)
    }
  }, [provider, reset])

  const handleCnicFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCnicFrontFile(file)
      setCnicFrontPreview(URL.createObjectURL(file))
      setDeleteCnicFront(false)
    }
  }

  const handleCnicBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCnicBackFile(file)
      setCnicBackPreview(URL.createObjectURL(file))
      setDeleteCnicBack(false)
    }
  }

  const handleDeleteCnicFront = () => {
    setCnicFrontFile(null)
    setCnicFrontPreview(null)
    setDeleteCnicFront(true)
  }

  const handleDeleteCnicBack = () => {
    setCnicBackFile(null)
    setCnicBackPreview(null)
    setDeleteCnicBack(true)
  }

  if (isLoading || plansLoading) return <Loader fullPage />
  if (error || !provider) return <ErrorState error="Provider not found." onRetry={() => getProvider(Number(providerId))} />

  const onSubmit = async (formData: FormData) => {
    try {
      await updateProvider({
        providerId: provider.id,
        request: {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          businessName: formData.businessName,
          supportPhone: formData.supportPhone,
          supportEmail: formData.supportEmail,
          cnicNumber: formData.cnicNumber,
          cnicExpiry: formData.cnicExpiry || undefined,
          deleteCnicFront: deleteCnicFront,
          deleteCnicBack: deleteCnicBack,
          planConfigId: formData.planConfigId,
        },
        cnicFront: cnicFrontFile ?? undefined,
        cnicBack: cnicBackFile ?? undefined,
      }).unwrap()
      toast.success('Provider updated successfully.')
      navigate(`/providers/${provider.id}`)
    } catch {
      toast.error('Failed to update provider.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Edit Provider — {provider.name}</h4>
      <Card className="shadow-sm" style={{ maxWidth: 700 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Business Name</Form.Label>
              <Form.Control {...register('businessName')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control isInvalid={!!errors.email} {...register('email')} />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control isInvalid={!!errors.mobileNumber} {...register('mobileNumber')} />
              <Form.Control.Feedback type="invalid">{errors.mobileNumber?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Support Phone</Form.Label>
              <Form.Control {...register('supportPhone')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Support Email</Form.Label>
              <Form.Control {...register('supportEmail')} />
            </Form.Group>

            <hr className="my-4" />
            <h6 className="mb-3">Subscription Plan</h6>

            <Form.Group className="mb-3">
              <Form.Label>Select Plan</Form.Label>
              <Form.Select {...register('planConfigId', { valueAsNumber: true })}>
                <option value="">No Plan Selected</option>
                {activePlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.planType === 'PERIOD_BASED'
                      ? `PKR ${plan.periodPrice?.toLocaleString()}/${plan.billingPeriod?.toLowerCase()}`
                      : `${plan.commissionPercentage}% per booking`
                    }
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr className="my-4" />
            <h6 className="mb-3">CNIC Information</h6>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>CNIC Number</Form.Label>
                  <Form.Control placeholder="e.g. 12345-1234567-1" {...register('cnicNumber')} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>CNIC Expiry Date</Form.Label>
                  <Form.Control type="date" {...register('cnicExpiry')} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>CNIC Front Image</Form.Label>
                <div className="border rounded p-3 text-center" style={{ minHeight: 150 }}>
                  {cnicFrontPreview ? (
                    <div className="position-relative">
                      <img src={cnicFrontPreview} alt="CNIC Front" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={handleDeleteCnicFront}>
                        <BsTrash />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Form.Control type="file" accept="image/*" onChange={handleCnicFrontChange} className="d-none" id="cnicFrontInput" />
                      <label htmlFor="cnicFrontInput" className="btn btn-outline-primary btn-sm">
                        <BsUpload className="me-1" /> Upload Front
                      </label>
                      <p className="text-muted small mt-2 mb-0">No image uploaded</p>
                    </div>
                  )}
                </div>
                {cnicFrontPreview && (
                  <div className="mt-2">
                    <Form.Control type="file" accept="image/*" onChange={handleCnicFrontChange} className="d-none" id="cnicFrontInputReplace" />
                    <label htmlFor="cnicFrontInputReplace" className="btn btn-outline-secondary btn-sm">
                      <BsUpload className="me-1" /> Replace
                    </label>
                  </div>
                )}
              </Col>
              <Col md={6}>
                <Form.Label>CNIC Back Image</Form.Label>
                <div className="border rounded p-3 text-center" style={{ minHeight: 150 }}>
                  {cnicBackPreview ? (
                    <div className="position-relative">
                      <img src={cnicBackPreview} alt="CNIC Back" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
                      <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={handleDeleteCnicBack}>
                        <BsTrash />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Form.Control type="file" accept="image/*" onChange={handleCnicBackChange} className="d-none" id="cnicBackInput" />
                      <label htmlFor="cnicBackInput" className="btn btn-outline-primary btn-sm">
                        <BsUpload className="me-1" /> Upload Back
                      </label>
                      <p className="text-muted small mt-2 mb-0">No image uploaded</p>
                    </div>
                  )}
                </div>
                {cnicBackPreview && (
                  <div className="mt-2">
                    <Form.Control type="file" accept="image/*" onChange={handleCnicBackChange} className="d-none" id="cnicBackInputReplace" />
                    <label htmlFor="cnicBackInputReplace" className="btn btn-outline-secondary btn-sm">
                      <BsUpload className="me-1" /> Replace
                    </label>
                  </div>
                )}
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => navigate(`/providers/${provider.id}`)}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
