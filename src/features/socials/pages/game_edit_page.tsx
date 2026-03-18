import { useState, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, InputGroup, ListGroup, Row, Col, Dropdown, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsSearch, BsX } from 'react-icons/bs'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { useListSportsMutation } from '../../facilities/api/facilities_api'
import { useListLocationsMutation } from '../../locations/api/locations_api'
import { useListConsumersMutation } from '../../consumers/api/consumers_api'
import { useListGameFormatsMutation, useGetGameMutation, useUpdateGameMutation } from '../api/socials_api'

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  organizerUserId: z.number().min(1, 'Organizer is required'),
  sportId: z.number().min(1, 'Sport is required'),
  gameFormat: z.string().min(1, 'Game format is required'),
  locationId: z.number().min(1, 'Location is required'),
  gameDate: z.string().min(1, 'Date is required').refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    return selectedDate >= today
  }, { message: 'Game date cannot be in the past' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  rules: z.string().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

type Organizer = { id: number; name: string; phone: string }

export default function GameEditPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()

  // Fetch game data
  const [getGame, { data: gameData, isLoading: gameLoading, error: gameError }] = useGetGameMutation()
  const game = gameData?.data

  // Organizer search state
  const [organizerSearch, setOrganizerSearch] = useState('')
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
  const [showOrganizerResults, setShowOrganizerResults] = useState(false)

  // Dropdowns state
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [sportSearch, setSportSearch] = useState('')
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')

  // API mutations
  const [listSports, { data: sportsData, isLoading: sportsLoading }] = useListSportsMutation()
  const sports = sportsData?.data ?? []

  const [listGameFormats, { data: formatsData, isLoading: formatsLoading }] = useListGameFormatsMutation()
  const formats = formatsData?.data ?? []

  const [listLocations, { data: locationsData, isLoading: locationsLoading }] = useListLocationsMutation()
  const locations = locationsData?.data?.content ?? []

  const [listConsumers, { data: consumersData, isLoading: consumersLoading }] = useListConsumersMutation()
  const consumers = consumersData?.data?.content ?? []

  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation()

  // Fetch game, sports, formats, locations on mount
  useEffect(() => {
    getGame(Number(gameId))
    listSports()
    listGameFormats()
    listLocations({ size: 100 })
  }, [gameId])

  // Fetch consumers when search changes
  useEffect(() => {
    if (organizerSearch.length >= 3) {
      listConsumers({ search: organizerSearch, size: 10 })
    }
  }, [organizerSearch])

  const { register, handleSubmit, formState: { errors }, control, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      organizerUserId: 0,
      sportId: 0,
      gameFormat: '',
      locationId: 0,
      gameDate: '',
      startTime: '',
      endTime: '',
      rules: '',
      description: '',
    },
  })

  // Load game data into form
  useEffect(() => {
    if (game) {
      reset({
        title: game.title,
        organizerUserId: game.createdByUserId,
        sportId: game.sportId ?? 0,
        gameFormat: game.gameFormat ?? '',
        locationId: game.locationId ?? 0,
        gameDate: game.gameDate ?? '',
        startTime: game.startTime ?? '',
        endTime: game.endTime ?? '',
        rules: game.rules ?? '',
        description: game.description ?? '',
      })
      if (game.organizerName) {
        setSelectedOrganizer({
          id: game.createdByUserId,
          name: game.organizerName,
          phone: game.organizerPhone ?? '',
        })
      }
    }
  }, [game, reset])

  const selectedSportId = watch('sportId')
  const selectedSport = sports.find(s => s.id === selectedSportId)

  const selectedFormatValue = watch('gameFormat')
  const selectedFormat = formats.find(f => f.value === selectedFormatValue)

  const selectedLocationId = watch('locationId')
  const selectedLocation = locations.find(l => l.id === selectedLocationId)

  const filteredSports = useMemo(() => {
    if (!sportSearch.trim()) return sports
    const search = sportSearch.toLowerCase()
    return sports.filter(s => s.name.toLowerCase().includes(search))
  }, [sports, sportSearch])

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return locations
    const search = locationSearch.toLowerCase()
    return locations.filter(l => l.name.toLowerCase().includes(search))
  }, [locations, locationSearch])

  const selectOrganizer = (user: { id: number; name: string; mobileNumber: string }) => {
    setSelectedOrganizer({ id: user.id, name: user.name, phone: user.mobileNumber })
    setOrganizerSearch('')
    setShowOrganizerResults(false)
    setValue('organizerUserId', user.id)
  }

  const clearOrganizer = () => {
    setSelectedOrganizer(null)
    setValue('organizerUserId', 0)
  }

  const onSubmit = async (data: FormData) => {
    try {
      await updateGame({
        gameId: Number(gameId),
        request: {
          title: data.title,
          description: data.description,
          organizerUserId: data.organizerUserId,
          sportId: data.sportId,
          gameFormat: data.gameFormat,
          locationId: data.locationId,
          gameDate: data.gameDate,
          startTime: data.startTime,
          endTime: data.endTime,
          rules: data.rules,
        },
      }).unwrap()
      toast.success('Game updated successfully.')
      navigate('/socials/games')
    } catch {
      toast.error('Failed to update game.')
    }
  }

  if (gameLoading) return <Loader fullPage />
  if (gameError || !game) return <ErrorState error="Game not found." onRetry={() => getGame(Number(gameId))} />

  return (
    <div>
      <h4 className="fw-bold mb-4">Edit Game — {game.title}</h4>
      <Card className="shadow-sm" style={{ maxWidth: 700 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Game Title <span className="text-danger">*</span></Form.Label>
              <Form.Control isInvalid={!!errors.title} {...register('title')} />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            {/* Organizer Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Organizer <span className="text-danger">*</span></Form.Label>
              {selectedOrganizer ? (
                <ListGroup>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                        <span className="text-white small">{selectedOrganizer.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="fw-semibold">{selectedOrganizer.name}</div>
                        <small className="text-muted">{selectedOrganizer.phone}</small>
                      </div>
                    </div>
                    <Button size="sm" variant="outline-danger" onClick={clearOrganizer}><BsX /></Button>
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <div className="position-relative">
                  <InputGroup>
                    <InputGroup.Text><BsSearch /></InputGroup.Text>
                    <Form.Control
                      placeholder="Enter phone number to search..."
                      value={organizerSearch}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '')
                        setOrganizerSearch(value)
                        setShowOrganizerResults(true)
                      }}
                      onFocus={() => setShowOrganizerResults(true)}
                      onBlur={() => setTimeout(() => setShowOrganizerResults(false), 200)}
                      isInvalid={!!errors.organizerUserId}
                    />
                    {consumersLoading && organizerSearch.length >= 3 && (
                      <InputGroup.Text><Spinner animation="border" size="sm" /></InputGroup.Text>
                    )}
                  </InputGroup>
                  {showOrganizerResults && consumers.length > 0 && (
                    <ListGroup className="position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                      {consumers.map(u => (
                        <ListGroup.Item key={u.id} action onClick={() => selectOrganizer(u)}>
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-muted">{u.mobileNumber}</small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {errors.organizerUserId && <div className="text-danger small mt-1">{errors.organizerUserId.message}</div>}
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                {/* Sport Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label>Sport <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="sportId"
                    control={control}
                    render={({ field }) => (
                      <Dropdown show={sportDropdownOpen} onToggle={setSportDropdownOpen}>
                        <Dropdown.Toggle
                          variant={errors.sportId ? 'outline-danger' : 'outline-secondary'}
                          className="w-100 text-start"
                          disabled={sportsLoading}
                        >
                          {sportsLoading ? <Spinner animation="border" size="sm" /> : selectedSport ? selectedSport.name : 'Select sport...'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          <div className="px-2 pb-2">
                            <InputGroup size="sm">
                              <InputGroup.Text><BsSearch /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search..."
                                value={sportSearch}
                                onChange={e => setSportSearch(e.target.value)}
                                autoFocus
                              />
                            </InputGroup>
                          </div>
                          {filteredSports.map(s => (
                            <Dropdown.Item
                              key={s.id}
                              active={field.value === s.id}
                              onClick={() => {
                                setValue('sportId', s.id)
                                setSportDropdownOpen(false)
                                setSportSearch('')
                              }}
                            >
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
              <Col md={6}>
                {/* Game Format Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label>Game Format <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="gameFormat"
                    control={control}
                    render={({ field }) => (
                      <Dropdown show={formatDropdownOpen} onToggle={setFormatDropdownOpen}>
                        <Dropdown.Toggle
                          variant={errors.gameFormat ? 'outline-danger' : 'outline-secondary'}
                          className="w-100 text-start"
                          disabled={formatsLoading}
                        >
                          {formatsLoading ? <Spinner animation="border" size="sm" /> : selectedFormat ? selectedFormat.displayName : 'Select format...'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                          {formats.map(f => (
                            <Dropdown.Item
                              key={f.value}
                              active={field.value === f.value}
                              onClick={() => {
                                setValue('gameFormat', f.value)
                                setFormatDropdownOpen(false)
                              }}
                            >
                              {f.displayName} ({f.minPlayers}-{f.maxPlayers} players)
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  />
                  {errors.gameFormat && <div className="text-danger small mt-1">{errors.gameFormat.message}</div>}
                </Form.Group>
              </Col>
            </Row>

            {/* Location Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Location <span className="text-danger">*</span></Form.Label>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={locationDropdownOpen} onToggle={setLocationDropdownOpen}>
                    <Dropdown.Toggle
                      variant={errors.locationId ? 'outline-danger' : 'outline-secondary'}
                      className="w-100 text-start"
                      disabled={locationsLoading}
                    >
                      {locationsLoading ? <Spinner animation="border" size="sm" /> : selectedLocation ? `${selectedLocation.name}, ${selectedLocation.city}` : 'Select location...'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                      <div className="px-2 pb-2">
                        <InputGroup size="sm">
                          <InputGroup.Text><BsSearch /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search..."
                            value={locationSearch}
                            onChange={e => setLocationSearch(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </div>
                      {filteredLocations.map(l => (
                        <Dropdown.Item
                          key={l.id}
                          active={field.value === l.id}
                          onClick={() => {
                            setValue('locationId', l.id)
                            setLocationDropdownOpen(false)
                            setLocationSearch('')
                          }}
                        >
                          {l.name}, {l.city}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              />
              {errors.locationId && <div className="text-danger small mt-1">{errors.locationId.message}</div>}
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Game Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" isInvalid={!!errors.gameDate} {...register('gameDate')} min={new Date().toISOString().split('T')[0]} />
                  <Form.Control.Feedback type="invalid">{errors.gameDate?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="time" isInvalid={!!errors.startTime} {...register('startTime')} />
                  <Form.Control.Feedback type="invalid">{errors.startTime?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control type="time" {...register('endTime')} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} {...register('description')} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rules</Form.Label>
              <Form.Control as="textarea" rows={2} {...register('rules')} />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => navigate('/socials/games')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
