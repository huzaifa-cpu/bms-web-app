import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, Dropdown, InputGroup, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsSearch } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useGetEmployeeMutation, useUpdateEmployeeMutation } from '../api/employees_api'
import { useListProvidersMutation } from '../../providers/api/providers_api'
import { useListLocationsByProviderMutation } from '../../locations/api/locations_api'
import { useListFacilitiesByLocationMutation } from '../../facilities/api/facilities_api'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  mobileNumber: z.string().min(1, 'Phone is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  providerId: z.number().min(1, 'Provider is required'),
  locationId: z.number().nullable().optional(),
  facilityId: z.number().nullable().optional(),
})
type FormData = z.infer<typeof schema>

export default function EmployeeEditPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()

  const [getEmployee, { data, isLoading, error }] = useGetEmployeeMutation()
  const employee = data?.data

  useEffect(() => {
    getEmployee(Number(employeeId))
  }, [employeeId])

  const [listProviders, { data: providersData, isLoading: providersLoading }] = useListProvidersMutation()
  const providers = providersData?.data?.content ?? []

  useEffect(() => {
    listProviders({ size: 100, approvalStates: ['APPROVED'] })
  }, [])

  const [updateEmployee] = useUpdateEmployeeMutation()

  const [providerSearch, setProviderSearch] = useState('')
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [facilitySearch, setFacilitySearch] = useState('')
  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false)

  const filteredProviders = useMemo(() => {
    if (!providerSearch.trim()) return providers
    const search = providerSearch.toLowerCase()
    return providers.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.businessName?.toLowerCase().includes(search))
    )
  }, [providers, providerSearch])

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: employee ? {
      name: employee.name,
      email: employee.email,
      mobileNumber: employee.mobileNumber,
      jobTitle: employee.jobTitle ?? '',
      providerId: employee.providerId ?? 0,
      locationId: employee.locationId ?? null,
      facilityId: employee.facilityId ?? null,
    } : undefined,
  })

  const selectedProviderId = watch('providerId')
  const selectedProvider = providers.find(p => p.id === selectedProviderId)

  const selectedLocationId = watch('locationId')
  const selectedFacilityId = watch('facilityId')

  // Fetch locations for selected provider
  const [listLocationsByProvider, { data: locationsData, isLoading: locationsLoading }] = useListLocationsByProviderMutation()
  const locations = locationsData?.data ?? []
  const selectedLocation = locations.find(l => l.id === selectedLocationId)

  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== 0) {
      listLocationsByProvider(selectedProviderId)
    }
  }, [selectedProviderId])

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return locations
    const search = locationSearch.toLowerCase()
    return locations.filter(l => l.name.toLowerCase().includes(search))
  }, [locations, locationSearch])

  // Fetch facilities for selected location
  const [listFacilitiesByLocation, { data: facilitiesData, isLoading: facilitiesLoading }] = useListFacilitiesByLocationMutation()
  const facilities = facilitiesData?.data ?? []
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId)

  useEffect(() => {
    if (selectedLocationId) {
      listFacilitiesByLocation(selectedLocationId)
    }
  }, [selectedLocationId])

  const filteredFacilities = useMemo(() => {
    if (!facilitySearch.trim()) return facilities
    const search = facilitySearch.toLowerCase()
    return facilities.filter(f => f.name.toLowerCase().includes(search))
  }, [facilities, facilitySearch])

  if (isLoading) return <Loader fullPage />
  if (error || !employee) return <ErrorState error="Employee not found." onRetry={() => getEmployee(Number(employeeId))} />

  const onSubmit = async (formData: FormData) => {
    try {
      await updateEmployee({
        employeeId: employee.id,
        request: {
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          jobTitle: formData.jobTitle,
          providerId: formData.providerId,
          locationId: formData.locationId,
          facilityId: formData.facilityId,
        }
      }).unwrap()
      toast.success('Employee updated successfully.')
      navigate(`/employees/${employee.id}`)
    } catch {
      toast.error('Failed to update employee.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Edit Employee — {employee.name}</h4>
      <Card className="shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
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
              <Form.Label>Job Title</Form.Label>
              <Form.Control isInvalid={!!errors.jobTitle} {...register('jobTitle')} />
              <Form.Control.Feedback type="invalid">{errors.jobTitle?.message}</Form.Control.Feedback>
            </Form.Group>

            {/* Provider Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label>Provider <span className="text-danger">*</span></Form.Label>
              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={providerDropdownOpen} onToggle={setProviderDropdownOpen}>
                    <Dropdown.Toggle
                      variant={errors.providerId ? 'outline-danger' : 'outline-secondary'}
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
                              setValue('providerId', provider.id)
                              // Reset dependent fields when provider changes
                              setValue('locationId', null)
                              setValue('facilityId', null)
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
              {errors.providerId && <div className="text-danger small mt-1">{errors.providerId.message}</div>}
            </Form.Group>

            {/* Location Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={locationDropdownOpen} onToggle={setLocationDropdownOpen}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={locationsLoading || !selectedProviderId}
                    >
                      {locationsLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : !selectedProviderId ? (
                        'Select a provider first...'
                      ) : selectedLocation ? (
                        <span>{selectedLocation.name}</span>
                      ) : (
                        'Select a location (optional)...'
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                      <div className="px-2 pb-2">
                        <InputGroup size="sm">
                          <InputGroup.Text><BsSearch /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search locations..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </div>
                      <Dropdown.Item
                        active={!field.value}
                        onClick={() => {
                          setValue('locationId', null)
                          setValue('facilityId', null)
                          setLocationDropdownOpen(false)
                          setLocationSearch('')
                        }}
                      >
                        <span className="text-muted">— None —</span>
                      </Dropdown.Item>
                      {filteredLocations.length === 0 ? (
                        <Dropdown.ItemText className="text-muted">No locations found</Dropdown.ItemText>
                      ) : (
                        filteredLocations.map(location => (
                          <Dropdown.Item
                            key={location.id}
                            active={field.value === location.id}
                            onClick={() => {
                              setValue('locationId', location.id)
                              // Reset facility when location changes
                              setValue('facilityId', null)
                              setLocationDropdownOpen(false)
                              setLocationSearch('')
                            }}
                          >
                            {location.name}
                            {location.city && <small className="text-muted ms-2">({location.city})</small>}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              />
            </Form.Group>

            {/* Facility Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label>Facility</Form.Label>
              <Controller
                name="facilityId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={facilityDropdownOpen} onToggle={setFacilityDropdownOpen}>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={facilitiesLoading || !selectedLocationId}
                    >
                      {facilitiesLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : !selectedLocationId ? (
                        'Select a location first...'
                      ) : selectedFacility ? (
                        <span>{selectedFacility.name}</span>
                      ) : (
                        'Select a facility (optional)...'
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                      <div className="px-2 pb-2">
                        <InputGroup size="sm">
                          <InputGroup.Text><BsSearch /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search facilities..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </div>
                      <Dropdown.Item
                        active={!field.value}
                        onClick={() => {
                          setValue('facilityId', null)
                          setFacilityDropdownOpen(false)
                          setFacilitySearch('')
                        }}
                      >
                        <span className="text-muted">— None —</span>
                      </Dropdown.Item>
                      {filteredFacilities.length === 0 ? (
                        <Dropdown.ItemText className="text-muted">No facilities found</Dropdown.ItemText>
                      ) : (
                        filteredFacilities.map(facility => (
                          <Dropdown.Item
                            key={facility.id}
                            active={field.value === facility.id}
                            onClick={() => {
                              setValue('facilityId', facility.id)
                              setFacilityDropdownOpen(false)
                              setFacilitySearch('')
                            }}
                          >
                            {facility.name}
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => navigate(`/employees/${employee.id}`)}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
