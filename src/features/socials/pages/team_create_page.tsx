import { useState, useRef, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, InputGroup, ListGroup, Badge, Dropdown, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsCamera, BsSearch, BsX, BsCheckCircleFill } from 'react-icons/bs'
import { useListSportsMutation } from '../../facilities/api/facilities_api'
import { useListConsumersMutation } from '../../consumers/api/consumers_api'
import { useCreateTeamMutation } from '../api/socials_api'

const schema = z.object({
  name: z.string().min(2, 'Team name is required'),
  sportId: z.number().min(1, 'Sport is required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

type Member = { id: number; name: string; phone: string; isCaptain: boolean }

export default function TeamCreatePage() {
  const navigate = useNavigate()

  // Image state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sport dropdown state
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [sportSearch, setSportSearch] = useState('')

  // Members state
  const [memberSearch, setMemberSearch] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // API mutations
  const [listSports, { data: sportsData, isLoading: sportsLoading }] = useListSportsMutation()
  const sports = sportsData?.data ?? []

  const [listConsumers, { data: consumersData, isLoading: consumersLoading }] = useListConsumersMutation()
  const consumers = consumersData?.data?.content ?? []

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation()

  // Fetch sports on mount
  useEffect(() => {
    listSports()
  }, [])

  // Fetch consumers when search changes
  useEffect(() => {
    if (memberSearch.length >= 3) {
      listConsumers({ search: memberSearch, size: 10 })
    }
  }, [memberSearch])

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      sportId: 0,
      description: '',
    },
  })

  const selectedSportId = watch('sportId')
  const selectedSport = sports.find(s => s.id === selectedSportId)

  const filteredSports = useMemo(() => {
    if (!sportSearch.trim()) return sports
    const search = sportSearch.toLowerCase()
    return sports.filter(s => s.name.toLowerCase().includes(search))
  }, [sports, sportSearch])

  // Filter out already added members
  const searchResults = consumers.filter(c => !members.some(m => m.id === c.id))

  const addMember = (user: { id: number; name: string; mobileNumber: string }) => {
    if (members.length >= 25) {
      toast.error('Maximum 25 members allowed')
      return
    }
    setMembers(prev => [...prev, { id: user.id, name: user.name, phone: user.mobileNumber, isCaptain: prev.length === 0 }])
    setMemberSearch('')
    setShowSearchResults(false)
  }

  const removeMember = (userId: number) => {
    setMembers(prev => {
      const updated = prev.filter(m => m.id !== userId)
      // If removed member was captain and there are still members, make first one captain
      if (prev.find(m => m.id === userId)?.isCaptain && updated.length > 0) {
        updated[0].isCaptain = true
      }
      return updated
    })
  }

  const setCaptain = (userId: number) => {
    setMembers(prev => prev.map(m => ({ ...m, isCaptain: m.id === userId })))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (members.length < 1) {
      toast.error('Please add at least 1 member')
      return
    }
    if (members.length > 25) {
      toast.error('Maximum 25 members allowed')
      return
    }

    try {
      await createTeam({
        request: {
          name: data.name,
          sportId: data.sportId,
          description: data.description,
          members: members.map(m => ({ userId: m.id, isCaptain: m.isCaptain })),
        },
        image: avatarFile ?? undefined,
      }).unwrap()
      toast.success('Team created successfully.')
      navigate('/socials/teams')
    } catch {
      toast.error('Failed to create team.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Create Team</h4>
      <Card className="shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <div className="text-center mb-4">
            <div
              className="position-relative d-inline-block"
              style={{ cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Team Avatar" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                  <BsCamera className="text-white" size={24} />
                </div>
              )}
              <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1" style={{ transform: 'translate(25%, 25%)' }}>
                <BsCamera className="text-white" size={14} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-muted small mt-2 mb-0">Click to add team logo</p>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Team Name <span className="text-danger">*</span></Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} {...register('description')} />
            </Form.Group>

            {/* Team Members */}
            <Form.Group className="mb-3">
              <Form.Label>Team Members <span className="text-danger">*</span> <small className="text-muted">(1-25 members)</small></Form.Label>
              <div className="position-relative">
                <InputGroup>
                  <InputGroup.Text><BsSearch /></InputGroup.Text>
                  <Form.Control
                    placeholder="Enter phone number to search..."
                    value={memberSearch}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '')
                      setMemberSearch(value)
                      setShowSearchResults(true)
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  />
                  {consumersLoading && memberSearch.length >= 3 && (
                    <InputGroup.Text><Spinner animation="border" size="sm" /></InputGroup.Text>
                  )}
                </InputGroup>
                {showSearchResults && searchResults.length > 0 && (
                  <ListGroup className="position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                    {searchResults.map(u => (
                      <ListGroup.Item
                        key={u.id}
                        action
                        onClick={() => addMember(u)}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-muted">{u.mobileNumber}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                {showSearchResults && memberSearch.length >= 3 && !consumersLoading && searchResults.length === 0 && (
                  <ListGroup className="position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                    <ListGroup.Item className="text-muted">No consumers found</ListGroup.Item>
                  </ListGroup>
                )}
              </div>
              {members.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Added Members ({members.length}/25):</small>
                  <ListGroup>
                    {members.map(m => (
                      <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, minWidth: 36 }}>
                            <span className="text-white small">{m.name[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="fw-semibold">{m.name}</div>
                            <small className="text-muted">{m.phone}</small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {m.isCaptain && <Badge bg="warning" text="dark"><BsCheckCircleFill className="me-1" />Captain</Badge>}
                          <div className="d-flex gap-1">
                            {!m.isCaptain && (
                              <Button size="sm" variant="outline-warning" title="Make Captain" onClick={() => setCaptain(m.id)}>
                                <BsCheckCircleFill />
                              </Button>
                            )}
                            <Button size="sm" variant="outline-danger" title="Remove" onClick={() => removeMember(m.id)}>
                              <BsX />
                            </Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create Team'}</Button>
              <Button variant="secondary" onClick={() => navigate('/socials/teams')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
