import { useState, useRef, useEffect } from 'react'
import { Tab, Tabs, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { BsCamera } from 'react-icons/bs'
import StorageService from '../../../core/services/storage_service'
import { useGetProfileMutation, useUpdateProfileMutation, useChangePasswordMutation } from '../api/profile_api'

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase letters, numbers, or underscores only'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format'),
  mobileNumber: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^03\d{9}$/.test(val), {
      message: 'Mobile number must start with 03 and be 11 digits',
    }),
})
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'New password must be at most 100 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const [getProfile, { data: profileData, isLoading, isError, error }] = useGetProfileMutation()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  useEffect(() => { getProfile(); }, [])
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()

  const profile = profileData?.data
  const user = StorageService.getUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use backend avatarUrl or local preview
  const displayAvatar = avatarPreview ?? profile?.avatarUrl ?? undefined

  const { register: regP, handleSubmit: handleP, reset: resetProfile, setError, formState: { errors: pe } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', name: '', email: '', mobileNumber: '' },
  })

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        username: profile.username ?? '',
        name: profile.name ?? '',
        email: profile.email ?? '',
        mobileNumber: profile.mobileNumber ?? '',
      })
      // Clear preview and pending file when fresh data loads
      setAvatarPreview(undefined)
      setPendingAvatarFile(undefined)
    }
  }, [profile, resetProfile])

  const { register: regW, handleSubmit: handleW, reset: resetW, setError: setPasswordError, formState: { errors: we } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store file for later submission
      setPendingAvatarFile(file)
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const result = await updateProfile({
        data: {
          username: data.username,
          name: data.name,
          email: data.email,
          mobileNumber: data.mobileNumber || undefined,
        },
        avatar: pendingAvatarFile,
      }).unwrap()

      // Update local storage with new profile data
      if (user && result.data) {
        StorageService.setUser({
          ...user,
          name: result.data.name,
          email: result.data.email,
        })
      }
      // Clear pending file after successful save
      setPendingAvatarFile(undefined)
      setAvatarPreview(undefined)
      toast.success('Profile updated successfully.')
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string> }; status?: number }

      // Map field-level errors if available
      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, message]) => {
          if (field === 'username' || field === 'name' || field === 'email' || field === 'mobileNumber') {
            setError(field, { message })
          }
        })
      }

      // Show toast for general errors
      const message = apiError.data?.message ?? 'Failed to update profile.'
      toast.error(message)
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap()
      toast.success('Password changed successfully.')
      resetW()
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string; errors?: Record<string, string> }; status?: number }

      // Map field-level errors if available
      if (apiError.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([field, message]) => {
          if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
            setPasswordError(field, { message })
          }
        })
      }

      // Show toast for general errors (e.g., "Current password is incorrect")
      const message = apiError.data?.message ?? 'Failed to change password.'
      toast.error(message)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  // Error state
  if (isError) {
    const apiError = error as { data?: { message?: string }; status?: number }
    return (
      <div style={{ maxWidth: 640 }}>
        <h4 className="fw-bold mb-4">My Profile</h4>
        <Alert variant="danger">
          {apiError?.data?.message ?? 'Failed to load profile. Please try again later.'}
        </Alert>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h4 className="fw-bold mb-4">My Profile</h4>
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k ?? 'profile')} className="mb-3">
        <Tab eventKey="profile" title="Profile Info">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <div
                  className="position-relative d-inline-block"
                  style={{ cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                  ) : (
                    <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                      <span className="text-white fs-3">{(profile?.name ?? 'A')[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1" style={{ transform: 'translate(25%, 25%)' }}>
                    <BsCamera className="text-white" size={14} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleAvatarChange} />
                <p className="text-muted small mt-2 mb-0">
                  {pendingAvatarFile ? 'New avatar selected - save profile to apply' : 'Click to change avatar'}
                </p>
              </div>
              <Form onSubmit={handleP(onProfileSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control isInvalid={!!pe.username} {...regP('username')} />
                  <Form.Control.Feedback type="invalid">{pe.username?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control isInvalid={!!pe.name} {...regP('name')} />
                  <Form.Control.Feedback type="invalid">{pe.name?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control isInvalid={!!pe.email} {...regP('email')} />
                  <Form.Control.Feedback type="invalid">{pe.email?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control isInvalid={!!pe.mobileNumber} {...regP('mobileNumber')} placeholder="Optional" />
                  <Form.Control.Feedback type="invalid">{pe.mobileNumber?.message}</Form.Control.Feedback>
                </Form.Group>
                <Button type="submit" variant="primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="password" title="Change Password">
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleW(onPasswordSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control type="password" isInvalid={!!we.currentPassword} {...regW('currentPassword')} />
                  <Form.Control.Feedback type="invalid">{we.currentPassword?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control type="password" isInvalid={!!we.newPassword} {...regW('newPassword')} />
                  <Form.Control.Feedback type="invalid">{we.newPassword?.message}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control type="password" isInvalid={!!we.confirmPassword} {...regW('confirmPassword')} />
                  <Form.Control.Feedback type="invalid">{we.confirmPassword?.message}</Form.Control.Feedback>
                </Form.Group>
                <Button type="submit" variant="primary" disabled={isChangingPassword}>{isChangingPassword ? 'Changing...' : 'Change Password'}</Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="preferences" title="Preferences">
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="mb-3">
                <Col sm={6}><small className="text-muted d-block">Role</small><p className="fw-semibold">{profile?.role ?? '—'}</p></Col>
                <Col sm={6}><small className="text-muted d-block">Account Status</small><p className="fw-semibold">{profile?.status ?? '—'}</p></Col>
                <Col sm={12}><small className="text-muted d-block">Last Login</small><p className="fw-semibold">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}</p></Col>
                <Col sm={12}><small className="text-muted d-block">Permissions</small><p>{user?.permissionsMap ? Object.keys(user.permissionsMap).length : 0} permission groups assigned</p></Col>
              </Row>
              <p className="text-muted small mb-0">Theme can be changed from the top bar.</p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}
