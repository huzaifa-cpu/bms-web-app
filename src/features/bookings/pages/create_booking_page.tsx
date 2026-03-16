import { useState, useEffect, useRef } from 'react'
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsSearch, BsArrowLeft, BsCheckCircle, BsChevronDown } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { ROUTES } from '../../../core/constants/routes'
import { useListProvidersQuery } from '../../providers/api/providers_api'
import { useListFacilitiesQuery } from '../../facilities/api/facilities_api'
import { useListConsumersQuery } from '../../consumers/api/consumers_api'
import { useCreateWalkInBookingMutation } from '../api/bookings_api'

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return { value: `${h}:00`, label: `${i % 12 || 12}:00 ${i >= 12 ? 'PM' : 'AM'}` }
})

export default function CreateBookingPage() {
  const navigate = useNavigate()

  // Provider search
  const [providerSearch, setProviderSearch] = useState('')
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const [selectedProviderName, setSelectedProviderName] = useState('')
  const providerDropdownRef = useRef<HTMLDivElement>(null)

  // Facility
  const [facilitySearch, setFacilitySearch] = useState('')
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [selectedFacilityName, setSelectedFacilityName] = useState('')
  const facilityDropdownRef = useRef<HTMLDivElement>(null)

  // Date & Time
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Consumer search
  const [consumerSearch, setConsumerSearch] = useState('')
  const [showConsumerDropdown, setShowConsumerDropdown] = useState(false)
  const [selectedConsumerId, setSelectedConsumerId] = useState<number | null>(null)
  const [selectedConsumerName, setSelectedConsumerName] = useState('')
  const consumerDropdownRef = useRef<HTMLDivElement>(null)

  // Amount & currency
  const [amount, setAmount] = useState<number>(0)
  const [currency] = useState('PKR')
  const [cashPaidNow, setCashPaidNow] = useState(false)
  const [notes, setNotes] = useState('')

  // API queries
  const { data: providersData } = useListProvidersQuery({ search: providerSearch, page: 0, size: 10, approvalStates: ['APPROVED'] })
  const { data: facilitiesData } = useListFacilitiesQuery({ search: facilitySearch, page: 0, size: 50, approvalState: ['APPROVED'] })
  const { data: consumersData } = useListConsumersQuery({ search: consumerSearch, page: 0, size: 10 })
  const [createWalkIn, { isLoading: isSubmitting }] = useCreateWalkInBookingMutation()

  const providers = providersData?.data?.content ?? []
  const facilities = facilitiesData?.data?.content ?? []
  const consumers = consumersData?.data?.content ?? []

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false)
      }
      if (facilityDropdownRef.current && !facilityDropdownRef.current.contains(event.target as Node)) {
        setShowFacilityDropdown(false)
      }
      if (consumerDropdownRef.current && !consumerDropdownRef.current.contains(event.target as Node)) {
        setShowConsumerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isFormValid = () => {
    return (
      selectedProviderId !== null &&
      selectedFacilityId !== null &&
      selectedDate &&
      startTime &&
      endTime &&
      endTime > startTime &&
      selectedConsumerId !== null &&
      amount > 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      toast.error('Please fill all required fields correctly.')
      return
    }

    try {
      await createWalkIn({
        providerUserId: selectedProviderId!,
        facilityId: selectedFacilityId!,
        bookingDate: selectedDate,
        startTime,
        endTime,
        amount,
        currency,
        consumerUserId: selectedConsumerId!,
        cashPaidNow,
        notes: notes || undefined,
      }).unwrap()
      toast.success('Walk-in booking created successfully!')
      navigate(ROUTES.BOOKINGS)
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } }
      toast.error(error?.data?.message || 'Failed to create booking.')
    }
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(ROUTES.BOOKINGS)}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Create Walk-in Booking</h4>
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
                        type="text"
                        placeholder="Search provider..."
                        value={selectedProviderId ? selectedProviderName : providerSearch}
                        onChange={e => {
                          setProviderSearch(e.target.value)
                          setShowProviderDropdown(true)
                          if (selectedProviderId) {
                            setSelectedProviderId(null)
                            setSelectedProviderName('')
                          }
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
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {providers.length === 0 ? (
                          <div className="p-2 text-muted text-center">No providers found</div>
                        ) : (
                          providers.map(p => (
                            <div
                              key={p.id}
                              className={`p-2 ${selectedProviderId === p.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedProviderId(p.id)
                                setSelectedProviderName(`${p.businessName || p.name} (${p.name})`)
                                setShowProviderDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (selectedProviderId !== p.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (selectedProviderId !== p.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{p.businessName || p.name}</div>
                              <small style={{ color: selectedProviderId === p.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {p.name} - {p.email}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Facility Selection */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Facility <span className="text-danger">*</span></Form.Label>
                  <div ref={facilityDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search facility..."
                        value={selectedFacilityId ? selectedFacilityName : facilitySearch}
                        onChange={e => {
                          setFacilitySearch(e.target.value)
                          setShowFacilityDropdown(true)
                          if (selectedFacilityId) {
                            setSelectedFacilityId(null)
                            setSelectedFacilityName('')
                          }
                        }}
                        onFocus={() => setShowFacilityDropdown(true)}
                      />
                      <InputGroup.Text style={{ cursor: 'pointer' }} onClick={() => setShowFacilityDropdown(!showFacilityDropdown)}>
                        <BsChevronDown />
                      </InputGroup.Text>
                    </InputGroup>
                    {showFacilityDropdown && (
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
                                {f.venueName} - {f.sportName}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Date */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Start Time */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Time <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={startTime} onChange={e => setStartTime(e.target.value)} required>
                    <option value="">Select start time...</option>
                    {TIME_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* End Time */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Time <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={endTime} onChange={e => setEndTime(e.target.value)} required>
                    <option value="">Select end time...</option>
                    {TIME_OPTIONS.filter(t => !startTime || t.value > startTime).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Consumer Selection */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Consumer <span className="text-danger">*</span></Form.Label>
                  <div ref={consumerDropdownRef} className="position-relative">
                    <InputGroup>
                      <InputGroup.Text><BsSearch /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={selectedConsumerId ? selectedConsumerName : consumerSearch}
                        onChange={e => {
                          setConsumerSearch(e.target.value)
                          setShowConsumerDropdown(true)
                          if (selectedConsumerId) {
                            setSelectedConsumerId(null)
                            setSelectedConsumerName('')
                          }
                        }}
                        onFocus={() => setShowConsumerDropdown(true)}
                      />
                      {selectedConsumerId && (
                        <InputGroup.Text>
                          <BsCheckCircle className="text-success" />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    {showConsumerDropdown && consumerSearch.length >= 2 && (
                      <div
                        className="position-absolute w-100 border rounded shadow-sm mt-1"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}
                      >
                        {consumers.length === 0 ? (
                          <div className="p-2 text-muted text-center">No consumers found</div>
                        ) : (
                          consumers.map(c => (
                            <div
                              key={c.id}
                              className={`p-2 ${selectedConsumerId === c.id ? 'bg-primary text-white' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedConsumerId(c.id)
                                setSelectedConsumerName(`${c.name} (${c.mobileNumber})`)
                                setShowConsumerDropdown(false)
                              }}
                              onMouseEnter={e => {
                                if (selectedConsumerId !== c.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'
                              }}
                              onMouseLeave={e => {
                                if (selectedConsumerId !== c.id) e.currentTarget.style.backgroundColor = ''
                              }}
                            >
                              <div className="fw-medium">{c.name}</div>
                              <small style={{ color: selectedConsumerId === c.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                                {c.mobileNumber} - {c.email}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              {/* Amount */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Amount ({currency}) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    min={1}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Cash Paid Now */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Cash Payment</Form.Label>
                  <Form.Check
                    type="switch"
                    label="Cash paid now"
                    checked={cashPaidNow}
                    onChange={e => setCashPaidNow(e.target.checked)}
                    className="mt-2"
                  />
                </Form.Group>
              </Col>

              {/* Notes */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Summary */}
              {isFormValid() && (
                <Col md={12}>
                  <div className="p-3 rounded border" style={{ backgroundColor: 'var(--color-bg-page)' }}>
                    <h6 className="fw-bold mb-2">Booking Summary</h6>
                    <Row>
                      <Col sm={6}>
                        <small className="text-muted">Provider:</small>
                        <p className="mb-1">{selectedProviderName}</p>
                      </Col>
                      <Col sm={6}>
                        <small className="text-muted">Facility:</small>
                        <p className="mb-1">{selectedFacilityName}</p>
                      </Col>
                      <Col sm={6}>
                        <small className="text-muted">Date & Time:</small>
                        <p className="mb-1">{selectedDate} | {startTime} - {endTime}</p>
                      </Col>
                      <Col sm={6}>
                        <small className="text-muted">Consumer:</small>
                        <p className="mb-1">{selectedConsumerName}</p>
                      </Col>
                      <Col sm={12}>
                        <small className="text-muted">Total Amount:</small>
                        <p className="mb-0 fw-bold fs-5 text-primary">{currency} {amount.toLocaleString()}</p>
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}

              {/* Submit */}
              <Col md={12}>
                <div className="d-flex gap-2 mt-2">
                  <Button type="submit" variant="primary" disabled={isSubmitting || !isFormValid()}>
                    {isSubmitting ? <><Spinner size="sm" className="me-1" />Creating...</> : 'Create Booking'}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(ROUTES.BOOKINGS)}>Cancel</Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
