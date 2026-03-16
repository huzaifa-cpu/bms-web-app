import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Button, Row, Col, Dropdown, InputGroup, Spinner, Table } from 'react-bootstrap'
import { BsArrowLeft, BsSearch, BsCamera, BsTrash } from 'react-icons/bs'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { useCreateFacilityMutation, useListSportsQuery } from '../api/facilities_api'
import { useListProvidersQuery } from '../../providers/api/providers_api'
import { useListLocationsByProviderQuery } from '../../locations/api/locations_api'
import type { FacilityScheduleDto } from '../api/facilities_types'

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const scheduleSchema = z.object({
  dayOfWeek: z.string(),
  enabled: z.boolean(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  pricePerHour: z.number().nullable(),
})

const schema = z.object({
  providerUserId: z.number({ required_error: 'Provider is required' }).min(1, 'Provider is required'),
  venueId: z.number({ required_error: 'Location is required' }).min(1, 'Location is required'),
  sportId: z.number({ required_error: 'Sport is required' }).min(1, 'Sport is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  schedules: z.array(scheduleSchema),
})
type FormData = z.infer<typeof schema>

const defaultSchedules: FacilityScheduleDto[] = DAYS_OF_WEEK.map(day => ({
  dayOfWeek: day,
  enabled: false,
  startTime: '09:00',
  endTime: '18:00',
  pricePerHour: null,
}))

export default function FacilityCreatePage() {
  const navigate = useNavigate()
  const [createFacility, { isLoading: isSaving }] = useCreateFacilityMutation()

  // Images state
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dropdowns state
  const [providerSearch, setProviderSearch] = useState('')
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [sportSearch, setSportSearch] = useState('')

  // API queries
  const { data: providersData, isLoading: providersLoading } = useListProvidersQuery({ size: 100, approvalStates: ['APPROVED'] })
  const providers = providersData?.data?.content ?? []

  const { data: sportsData, isLoading: sportsLoading } = useListSportsQuery()
  const sports = sportsData?.data ?? []

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      providerUserId: 0,
      venueId: 0,
      sportId: 0,
      name: '',
      description: '',
      schedules: defaultSchedules,
    },
  })

  const selectedProviderId = watch('providerUserId')
  const selectedProvider = providers.find(p => p.id === selectedProviderId)

  // Fetch locations for selected provider
  const { data: locationsData, isLoading: locationsLoading } = useListLocationsByProviderQuery(selectedProviderId, {
    skip: !selectedProviderId || selectedProviderId === 0,
  })
  const locations = locationsData?.data ?? []

  const selectedVenueId = watch('venueId')
  const selectedLocation = locations.find(l => l.id === selectedVenueId)

  const selectedSportId = watch('sportId')
  const selectedSport = sports.find(s => s.id === selectedSportId)

  const schedules = watch('schedules')

  const filteredProviders = useMemo(() => {
    if (!providerSearch.trim()) return providers
    const search = providerSearch.toLowerCase()
    return providers.filter(p => p.name.toLowerCase().includes(search) || (p.businessName?.toLowerCase().includes(search)))
  }, [providers, providerSearch])

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return locations
    const search = locationSearch.toLowerCase()
    return locations.filter(l => l.name.toLowerCase().includes(search))
  }, [locations, locationSearch])

  const filteredSports = useMemo(() => {
    if (!sportSearch.trim()) return sports
    const search = sportSearch.toLowerCase()
    return sports.filter(s => s.name.toLowerCase().includes(search))
  }, [sports, sportSearch])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const updateSchedule = (dayIndex: number, field: keyof FacilityScheduleDto, value: unknown) => {
    const newSchedules = [...schedules]
    newSchedules[dayIndex] = { ...newSchedules[dayIndex], [field]: value }
    setValue('schedules', newSchedules)
  }

  const onSubmit = async (formData: FormData) => {
    if (images.length < 3) {
      toast.error('Please upload at least 3 images')
      return
    }

    try {
      const result = await createFacility({
        request: {
          providerUserId: formData.providerUserId,
          venueId: formData.venueId,
          sportId: formData.sportId,
          name: formData.name,
          description: formData.description,
          schedules: formData.schedules,
        },
        images,
      }).unwrap()
      toast.success('Facility created successfully.')
      navigate(`/facilities/${result.data?.id}`)
    } catch {
      toast.error('Failed to create facility.')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/facilities')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Create Facility</h4>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Images Section */}
        <Card className="shadow-sm mb-4">
          <Card.Header><strong>Images</strong> <span className="text-muted">(3-5 required)</span></Card.Header>
          <Card.Body>
            <div className="d-flex gap-3 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="position-relative" style={{ width: 120, height: 120 }}>
                  <img src={preview} alt={`Preview ${index}`} className="rounded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 rounded-circle p-1"
                    style={{ transform: 'translate(25%, -25%)' }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <BsTrash size={12} />
                  </Button>
                </div>
              ))}
              {images.length < 5 && (
                <div
                  className="d-flex align-items-center justify-content-center border rounded bg-light"
                  style={{ width: 120, height: 120, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <BsCamera size={32} className="text-muted" />
                </div>
              )}
              <input type="file" ref={fileInputRef} className="d-none" accept="image/*" multiple onChange={handleImageChange} />
            </div>
            <p className="text-muted small mt-2 mb-0">{images.length}/5 images uploaded</p>
          </Card.Body>
        </Card>

        {/* Basic Info */}
        <Card className="shadow-sm mb-4">
          <Card.Header><strong>Basic Information</strong></Card.Header>
          <Card.Body>
            <Row className="g-3">
              {/* Provider Dropdown */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Provider <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="providerUserId"
                    control={control}
                    render={({ field }) => (
                      <Dropdown show={providerDropdownOpen} onToggle={setProviderDropdownOpen}>
                        <Dropdown.Toggle variant={errors.providerUserId ? 'outline-danger' : 'outline-secondary'} className="w-100 text-start" disabled={providersLoading}>
                          {providersLoading ? <Spinner animation="border" size="sm" /> : selectedProvider ? (selectedProvider.businessName || selectedProvider.name) : 'Select provider...'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          <div className="px-2 pb-2">
                            <InputGroup size="sm">
                              <InputGroup.Text><BsSearch /></InputGroup.Text>
                              <Form.Control placeholder="Search..." value={providerSearch} onChange={e => setProviderSearch(e.target.value)} autoFocus />
                            </InputGroup>
                          </div>
                          {filteredProviders.map(p => (
                            <Dropdown.Item key={p.id} active={field.value === p.id} onClick={() => { setValue('providerUserId', p.id); setValue('venueId', 0); setProviderDropdownOpen(false); setProviderSearch(''); }}>
                              {p.businessName || p.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  />
                  {errors.providerUserId && <div className="text-danger small mt-1">{errors.providerUserId.message}</div>}
                </Form.Group>
              </Col>

              {/* Location Dropdown */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="venueId"
                    control={control}
                    render={({ field }) => (
                      <Dropdown show={locationDropdownOpen} onToggle={setLocationDropdownOpen}>
                        <Dropdown.Toggle variant={errors.venueId ? 'outline-danger' : 'outline-secondary'} className="w-100 text-start" disabled={!selectedProviderId || locationsLoading}>
                          {locationsLoading ? <Spinner animation="border" size="sm" /> : selectedLocation ? selectedLocation.name : 'Select location...'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          <div className="px-2 pb-2">
                            <InputGroup size="sm">
                              <InputGroup.Text><BsSearch /></InputGroup.Text>
                              <Form.Control placeholder="Search..." value={locationSearch} onChange={e => setLocationSearch(e.target.value)} autoFocus />
                            </InputGroup>
                          </div>
                          {filteredLocations.length === 0 ? (
                            <Dropdown.ItemText className="text-muted">No locations found</Dropdown.ItemText>
                          ) : filteredLocations.map(l => (
                            <Dropdown.Item key={l.id} active={field.value === l.id} onClick={() => { setValue('venueId', l.id); setLocationDropdownOpen(false); setLocationSearch(''); }}>
                              {l.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  />
                  {errors.venueId && <div className="text-danger small mt-1">{errors.venueId.message}</div>}
                </Form.Group>
              </Col>

              {/* Sport Dropdown */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sport Type <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="sportId"
                    control={control}
                    render={({ field }) => (
                      <Dropdown show={sportDropdownOpen} onToggle={setSportDropdownOpen}>
                        <Dropdown.Toggle variant={errors.sportId ? 'outline-danger' : 'outline-secondary'} className="w-100 text-start" disabled={sportsLoading}>
                          {sportsLoading ? <Spinner animation="border" size="sm" /> : selectedSport ? selectedSport.name : 'Select sport...'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          <div className="px-2 pb-2">
                            <InputGroup size="sm">
                              <InputGroup.Text><BsSearch /></InputGroup.Text>
                              <Form.Control placeholder="Search..." value={sportSearch} onChange={e => setSportSearch(e.target.value)} autoFocus />
                            </InputGroup>
                          </div>
                          {filteredSports.map(s => (
                            <Dropdown.Item key={s.id} active={field.value === s.id} onClick={() => { setValue('sportId', s.id); setSportDropdownOpen(false); setSportSearch(''); }}>
                              {s.name}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  />
                  {errors.sportId && <div className="text-danger small mt-1">{errors.sportId.message}</div>}
                </Form.Group>
              </Col>

              {/* Name */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Facility Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control isInvalid={!!errors.name} {...register('name')} placeholder="e.g. Court 1" />
                  <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} {...register('description')} placeholder="Optional description..." />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Schedule & Pricing */}
        <Card className="shadow-sm mb-4">
          <Card.Header><strong>Schedule & Pricing</strong></Card.Header>
          <Card.Body>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Day</th>
                  <th style={{ width: 80 }}>Enabled</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Price/Hour (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => (
                  <tr key={schedule.dayOfWeek}>
                    <td className="align-middle fw-medium">{schedule.dayOfWeek}</td>
                    <td className="align-middle text-center">
                      <Form.Check
                        type="switch"
                        checked={schedule.enabled}
                        onChange={e => updateSchedule(index, 'enabled', e.target.checked)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={schedule.startTime ?? ''}
                        onChange={e => updateSchedule(index, 'startTime', e.target.value)}
                        disabled={!schedule.enabled}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        size="sm"
                        value={schedule.endTime ?? ''}
                        onChange={e => updateSchedule(index, 'endTime', e.target.value)}
                        disabled={!schedule.enabled}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        placeholder="0"
                        value={schedule.pricePerHour ?? ''}
                        onChange={e => updateSchedule(index, 'pricePerHour', e.target.value ? Number(e.target.value) : null)}
                        disabled={!schedule.enabled}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Creating...' : 'Create Facility'}</Button>
          <Button variant="secondary" onClick={() => navigate('/facilities')}>Cancel</Button>
        </div>
      </Form>
    </div>
  )
}

