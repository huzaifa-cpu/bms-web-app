import { useState, useEffect, useRef } from 'react'
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsArrowLeft, BsChevronDown } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../../core/constants/routes'
import { useListConsumersQuery } from '../../consumers/api/consumers_api'
import { useListLocationsQuery } from '../../locations/api/locations_api'
import { useListFacilitiesByVenueQuery } from '../../facilities/api/facilities_api'
import { useCreateDisputeMutation } from '../api/disputes_api'
import type { DisputeTypeDto } from '../api/disputes_types'

const DISPUTE_TYPES: { value: DisputeTypeDto; label: string }[] = [
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'SERVICE_QUALITY', label: 'Service Quality' },
  { value: 'CANCELLATION', label: 'Cancellation' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'OTHER', label: 'Other' },
]

export default function DisputeCreatePage() {
  const navigate = useNavigate()

  // Consumer search (raised by)
  const [raisedBySearch, setRaisedBySearch] = useState('')
  const [showRaisedByDropdown, setShowRaisedByDropdown] = useState(false)
  const [raisedByUserId, setRaisedByUserId] = useState<number | null>(null)
  const [raisedByName, setRaisedByName] = useState('')
  const raisedByDropdownRef = useRef<HTMLDivElement>(null)

  // Location search
  const [locationSearch, setLocationSearch] = useState('')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [selectedLocationName, setSelectedLocationName] = useState('')
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  // Facility search
  const [facilitySearch, setFacilitySearch] = useState('')
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [selectedFacilityName, setSelectedFacilityName] = useState('')
  const facilityDropdownRef = useRef<HTMLDivElement>(null)

  // Form fields
  const [disputeType, setDisputeType] = useState<DisputeTypeDto>('OTHER')
  const [bookingId, setBookingId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  // API queries
  const { data: raisedByConsumersData } = useListConsumersQuery({ search: raisedBySearch, page: 0, size: 10 })
  const { data: locationsData } = useListLocationsQuery({ search: locationSearch, page: 0, size: 50, approvalState: ['APPROVED'] })
  const { data: facilitiesData } = useListFacilitiesByVenueQuery(selectedLocationId!, {
    skip: !selectedLocationId,
  })
  const [createDispute, { isLoading: isSubmitting }] = useCreateDisputeMutation()

  const raisedByConsumers = raisedByConsumersData?.data?.content ?? []
  const locations = locationsData?.data?.content ?? []
  const facilities = facilitiesData?.data ?? []

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (raisedByDropdownRef.current && !raisedByDropdownRef.current.contains(event.target as Node)) {
        setShowRaisedByDropdown(false)
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
      if (facilityDropdownRef.current && !facilityDropdownRef.current.contains(event.target as Node)) {
        setShowFacilityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset facility when location changes
  useEffect(() => {
    setSelectedFacilityId(null)
    setSelectedFacilityName('')
    setFacilitySearch('')
  }, [selectedLocationId])

  const isFormValid = () => {
    return raisedByUserId !== null && subject.trim() !== '' && description.trim() !== ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      toast.error('Please fill all required fields.')
      return
    }

    try {
      await createDispute({
        raisedByUserId: raisedByUserId!,
        locationId: selectedLocationId ?? undefined,
        facilityId: selectedFacilityId ?? undefined,
        type: disputeType,
        bookingId: bookingId ? Number(bookingId) : undefined,
        subject: subject.trim(),
        description: description.trim(),
      }).unwrap()
      toast.success('Dispute created successfully.')
      navigate(ROUTES.DISPUTES)
    } catch {
      toast.error('Failed to create dispute.')
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.DISPUTES)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Create Dispute</h4>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Raised By User */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Raised By User <span className="text-danger">*</span></Form.Label>
                  <div ref={raisedByDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        placeholder="Search consumer..."
                        value={raisedByName || raisedBySearch}
                        onChange={(e) => {
                          setRaisedBySearch(e.target.value)
                          setRaisedByName('')
                          setRaisedByUserId(null)
                          setShowRaisedByDropdown(true)
                        }}
                        onFocus={() => setShowRaisedByDropdown(true)}
                      />
                      <InputGroup.Text style={{ cursor: 'pointer' }} onClick={() => setShowRaisedByDropdown(!showRaisedByDropdown)}>
                        <BsChevronDown />
                      </InputGroup.Text>
                    </InputGroup>
                    {showRaisedByDropdown && (
                      <div
                        className="position-absolute w-100 border rounded shadow-sm mt-1"
                        style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {raisedByConsumers.length === 0 ? (
                          <div className="p-2 text-muted text-center">No consumers found</div>
                        ) : (
                          raisedByConsumers.map((c: any) => (
                            <div
                              key={c.id}
                              className={`p-2 ${raisedByUserId === c.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setRaisedByUserId(c.id)
                                setRaisedByName(c.name || c.displayName || `User #${c.id}`)
                                setShowRaisedByDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (raisedByUserId !== c.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (raisedByUserId !== c.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{c.name || c.displayName || 'N/A'}</div>
                              <small style={{ color: raisedByUserId === c.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {c.email ?? `ID: ${c.id}`}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Location */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location (optional)</Form.Label>
                  <div ref={locationDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search location..."
                        value={selectedLocationId ? selectedLocationName : locationSearch}
                        onChange={e => {
                          setLocationSearch(e.target.value)
                          setShowLocationDropdown(true)
                          if (selectedLocationId) {
                            setSelectedLocationId(null)
                            setSelectedLocationName('')
                          }
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                      />
                      <InputGroup.Text style={{ cursor: 'pointer' }} onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
                        <BsChevronDown />
                      </InputGroup.Text>
                    </InputGroup>
                    {showLocationDropdown && (
                      <div
                        className="position-absolute w-100 border rounded shadow-sm mt-1"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {locations.filter(l =>
                          !locationSearch || l.name.toLowerCase().includes(locationSearch.toLowerCase())
                        ).length === 0 ? (
                          <div className="p-2 text-muted text-center">No locations found</div>
                        ) : (
                          locations.filter(l =>
                            !locationSearch || l.name.toLowerCase().includes(locationSearch.toLowerCase())
                          ).map(l => (
                            <div
                              key={l.id}
                              className={`p-2 ${selectedLocationId === l.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedLocationId(l.id)
                                setSelectedLocationName(l.name)
                                setShowLocationDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (selectedLocationId !== l.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (selectedLocationId !== l.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{l.name}</div>
                              <small style={{ color: selectedLocationId === l.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {l.city ?? 'N/A'}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Facility */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Facility (optional)</Form.Label>
                  <div ref={facilityDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={selectedLocationId ? "Search facility..." : "Select location first..."}
                        value={selectedFacilityId ? selectedFacilityName : facilitySearch}
                        disabled={!selectedLocationId}
                        onChange={e => {
                          setFacilitySearch(e.target.value)
                          setShowFacilityDropdown(true)
                          if (selectedFacilityId) {
                            setSelectedFacilityId(null)
                            setSelectedFacilityName('')
                          }
                        }}
                        onFocus={() => selectedLocationId && setShowFacilityDropdown(true)}
                      />
                      <InputGroup.Text style={{ cursor: selectedLocationId ? 'pointer' : 'not-allowed' }} onClick={() => selectedLocationId && setShowFacilityDropdown(!showFacilityDropdown)}>
                        <BsChevronDown />
                      </InputGroup.Text>
                    </InputGroup>
                    {showFacilityDropdown && selectedLocationId && (
                      <div
                        className="position-absolute w-100 border rounded shadow-sm mt-1"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {facilities.filter(f =>
                          !facilitySearch || f.name.toLowerCase().includes(facilitySearch.toLowerCase())
                        ).length === 0 ? (
                          <div className="p-2 text-muted text-center">No facilities found</div>
                        ) : (
                          facilities.filter(f =>
                            !facilitySearch || f.name.toLowerCase().includes(facilitySearch.toLowerCase())
                          ).map(f => (
                            <div
                              key={f.id}
                              className={`p-2 ${selectedFacilityId === f.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedFacilityId(f.id)
                                setSelectedFacilityName(f.name)
                                setShowFacilityDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (selectedFacilityId !== f.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (selectedFacilityId !== f.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{f.name}</div>
                              <small style={{ color: selectedFacilityId === f.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {f.sportName ?? 'N/A'}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Dispute Type */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dispute Type</Form.Label>
                  <Form.Select value={disputeType} onChange={(e) => setDisputeType(e.target.value as DisputeTypeDto)}>
                    {DISPUTE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Booking ID */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Booking ID (optional)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter booking ID if applicable"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Subject */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subject <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter dispute subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter dispute description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col md={12}>
                <div className="d-flex gap-2 justify-content-end">
                  <Button variant="secondary" onClick={() => navigate(ROUTES.DISPUTES)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting || !isFormValid()}>
                    {isSubmitting ? <><Spinner size="sm" className="me-2" />Creating...</> : 'Create Dispute'}
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
