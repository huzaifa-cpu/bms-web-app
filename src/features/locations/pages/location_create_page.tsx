import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Button, Row, Col, Dropdown, InputGroup, Spinner } from 'react-bootstrap'
import { BsArrowLeft, BsSearch } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { useCreateLocationMutation } from '../api/locations_api'
import { useListProvidersQuery } from '../../providers/api/providers_api'

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan',
  'Gujranwala', 'Peshawar', 'Quetta', 'Islamabad', 'Hyderabad',
]

const schema = z.object({
  providerUserId: z.number({ required_error: 'Provider is required' }).min(1, 'Provider is required'),
  name: z.string().min(1, 'Name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
})
type FormData = z.infer<typeof schema>

export default function LocationCreatePage() {
  const navigate = useNavigate()
  const [createLocation, { isLoading: isSaving }] = useCreateLocationMutation()

  const { data: providersData, isLoading: providersLoading } = useListProvidersQuery({ size: 100, approvalStates: ['APPROVED'] })
  const providers = providersData?.data?.content ?? []

  const [providerSearch, setProviderSearch] = useState('')
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false)

  const filteredProviders = useMemo(() => {
    if (!providerSearch.trim()) return providers
    const search = providerSearch.toLowerCase()
    return providers.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.businessName?.toLowerCase().includes(search))
    )
  }, [providers, providerSearch])

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      providerUserId: 0,
      name: '',
      addressLine1: '',
      city: '',
    },
  })

  const selectedProviderId = watch('providerUserId')
  const selectedProvider = providers.find(p => p.id === selectedProviderId)

  const onSubmit = async (formData: FormData) => {
    try {
      const result = await createLocation(formData).unwrap()
      toast.success('Location created successfully.')
      navigate(`/locations/${result.data?.id}`)
    } catch {
      toast.error('Failed to create location.')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/locations')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Create Location</h4>
      </div>
      <Card className="shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Provider Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label>Provider <span className="text-danger">*</span></Form.Label>
              <Controller
                name="providerUserId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={providerDropdownOpen} onToggle={setProviderDropdownOpen}>
                    <Dropdown.Toggle
                      variant={errors.providerUserId ? 'outline-danger' : 'outline-secondary'}
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={providersLoading}
                    >
                      {providersLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : selectedProvider ? (
                        <span>{selectedProvider.businessName || selectedProvider.name}</span>
                      ) : (
                        'Select a provider...'
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                      <div className="px-2 pb-2">
                        <InputGroup size="sm">
                          <InputGroup.Text><BsSearch /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search providers..."
                            value={providerSearch}
                            onChange={(e) => setProviderSearch(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </div>
                      {filteredProviders.length === 0 ? (
                        <Dropdown.ItemText className="text-muted">No providers found</Dropdown.ItemText>
                      ) : (
                        filteredProviders.map(provider => (
                          <Dropdown.Item
                            key={provider.id}
                            active={field.value === provider.id}
                            onClick={() => {
                              setValue('providerUserId', provider.id)
                              setProviderDropdownOpen(false)
                              setProviderSearch('')
                            }}
                          >
                            {provider.businessName || provider.name}
                            <small className="text-muted ms-2">({provider.email})</small>
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              />
              {errors.providerUserId && <div className="text-danger small mt-1">{errors.providerUserId.message}</div>}
            </Form.Group>

            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Location Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control isInvalid={!!errors.name} {...register('name')} placeholder="e.g. Sports Arena" />
                  <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control isInvalid={!!errors.addressLine1} {...register('addressLine1')} placeholder="Enter full address" />
                  <Form.Control.Feedback type="invalid">{errors.addressLine1?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City <span className="text-danger">*</span></Form.Label>
                  <Form.Select isInvalid={!!errors.city} {...register('city')}>
                    <option value="">Select City...</option>
                    {PAKISTAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.city?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-4 d-flex gap-2">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create Location'}</Button>
              <Button variant="secondary" onClick={() => navigate('/locations')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

