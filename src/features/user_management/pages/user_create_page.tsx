import { useState, useRef, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, Form, Button, InputGroup, Dropdown, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BsCamera, BsEye, BsEyeSlash, BsSearch } from 'react-icons/bs'
import { useCreateUserMutation } from '../api/users_api'
import { useListRolesQuery } from '../api/roles_api'

const schema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase letters, numbers, or underscores only'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format'),
  mobileNumber: z.string()
    .min(1, 'Phone is required')
    .refine((val) => /^03\d{9}$/.test(val), {
      message: 'Mobile number must start with 03 and be 11 digits',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters'),
  roleId: z.number().min(1, 'Role is required'),
})
type FormData = z.infer<typeof schema>

export default function UserCreatePage() {
  const navigate = useNavigate()
  const [createUser, { isLoading }] = useCreateUserMutation()
  const { data: rolesData, isLoading: rolesLoading } = useListRolesQuery()
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | undefined>(undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [roleSearch, setRoleSearch] = useState('')
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roles = rolesData?.data ?? []
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles
    const search = roleSearch.toLowerCase()
    return roles.filter(r => r.roleName.toLowerCase().includes(search))
  }, [roles, roleSearch])

  const { register, handleSubmit, formState: { errors }, setError, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', name: '', email: '', mobileNumber: '', password: '', roleId: 0 },
  })

  const selectedRoleId = watch('roleId')
  const selectedRole = roles.find(r => r.id === selectedRoleId)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (formData: FormData) => {
    try {
      await createUser({
        data: {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          roleId: formData.roleId,
        },
        avatar: pendingAvatarFile,
      }).unwrap()
      toast.success('User created successfully.')
      navigate('/users')
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string> }; status?: number }

      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, message]) => {
          if (field === 'username' || field === 'name' || field === 'email' || field === 'mobileNumber' || field === 'password' || field === 'roleId') {
            setError(field as keyof FormData, { message })
          }
        })
      }

      const message = apiError.data?.message ?? 'Failed to create user.'
      toast.error(message)
    }
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h4 className="fw-bold mb-4">Create User</h4>
      <Card className="shadow-sm">
        <Card.Body>
          {/* Avatar Upload */}
          <div className="text-center mb-4">
            <div
              className="position-relative d-inline-block"
              style={{ cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                  <span className="text-white fs-3">?</span>
                </div>
              )}
              <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1" style={{ transform: 'translate(25%, 25%)' }}>
                <BsCamera className="text-white" size={14} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleAvatarChange} />
            <p className="text-muted small mt-2 mb-0">
              {pendingAvatarFile ? 'Avatar selected' : 'Click to add avatar (optional)'}
            </p>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                isInvalid={!!errors.username}
                {...register('username')}
                placeholder="e.g. john_doe"
              />
              <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control isInvalid={!!errors.name} {...register('name')} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" isInvalid={!!errors.email} {...register('email')} />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                isInvalid={!!errors.mobileNumber}
                {...register('mobileNumber')}
                placeholder="03xxxxxxxxx"
              />
              <Form.Control.Feedback type="invalid">{errors.mobileNumber?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  isInvalid={!!errors.password}
                  {...register('password')}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </Button>
                <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Role Selection with Search */}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Dropdown show={roleDropdownOpen} onToggle={setRoleDropdownOpen}>
                    <Dropdown.Toggle
                      variant={errors.roleId ? 'outline-danger' : 'outline-secondary'}
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={rolesLoading}
                    >
                      {rolesLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : selectedRole ? (
                        selectedRole.roleName
                      ) : (
                        'Select a role...'
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100" style={{ maxHeight: 250, overflowY: 'auto' }}>
                      <div className="px-2 pb-2">
                        <InputGroup size="sm">
                          <InputGroup.Text><BsSearch /></InputGroup.Text>
                          <Form.Control
                            placeholder="Search roles..."
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </div>
                      {filteredRoles.length === 0 ? (
                        <Dropdown.ItemText className="text-muted">No roles found</Dropdown.ItemText>
                      ) : (
                        filteredRoles.map(role => (
                          <Dropdown.Item
                            key={role.id}
                            active={field.value === role.id}
                            onClick={() => {
                              setValue('roleId', role.id)
                              setRoleDropdownOpen(false)
                              setRoleSearch('')
                            }}
                          >
                            {role.roleName}
                            <small className="text-muted ms-2">({role.roleType})</small>
                          </Dropdown.Item>
                        ))
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              />
              {errors.roleId && <div className="text-danger small mt-1">{errors.roleId.message}</div>}
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
