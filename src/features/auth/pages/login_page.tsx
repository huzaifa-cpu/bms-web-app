import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { toast } from 'react-toastify'
import AuthService from '../../../core/services/auth_service'
import { ROUTES } from '../../../core/constants/routes'
import { useLoginMutation } from '../api/auth_api'
import { useLazyGetProfileQuery } from '../../profile/api/profile_api'
import { getDeviceId } from '../../../core/utils/device_utils'
import { mapToAppError } from '../../../core/errors/error_mapper'

const schema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading, isSuccess, isError, error, data, reset }] = useLoginMutation()
  const [fetchProfile] = useLazyGetProfileQuery()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) })

  // Reset mutation state on mount to clear any stale state from previous attempts
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (formData: LoginForm) => {
    const deviceId = getDeviceId()
    await login({
      identifier: formData.identifier,
      password: formData.password,
      deviceId,
    })
  }

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (isSuccess && data?.success && data.data) {
        // Store auth session first
        AuthService.storeSession(data.data)

        // Fetch profile to get complete user data (name, email, etc.)
        try {
          const profileResult = await fetchProfile().unwrap()
          if (profileResult?.data) {
            // Update stored user with profile data
            AuthService.updateUserFromProfile(profileResult.data)
          }
        } catch {
          // Profile fetch failed, but login was successful - continue anyway
          console.warn('Failed to fetch profile after login')
        }

        toast.success(data.successMessage || 'Welcome back!')
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    }

    handleLoginSuccess()
  }, [isSuccess, data, navigate, fetchProfile])

  const getErrorMessage = (): string | null => {
    if (!isError || !error) return null

    // Check if it's an API response with error message
    const apiError = error as { data?: { errorMessage?: string; message?: string } }
    if (apiError.data?.errorMessage) {
      return apiError.data.errorMessage
    }
    if (apiError.data?.message) {
      return apiError.data.message
    }

    // Fall back to generic error mapping
    const appError = mapToAppError(error)
    return appError.message
  }

  const errorMessage = getErrorMessage()

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h4 className="mb-4 text-center">Sign In</h4>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Email or Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter email or username"
              isInvalid={!!errors.identifier}
              disabled={isLoading}
              {...register('identifier')}
            />
            <Form.Control.Feedback type="invalid">{errors.identifier?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                isInvalid={!!errors.password}
                disabled={isLoading}
                {...register('password')}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </Button>
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="d-flex justify-content-end mb-3">
            <Link to={ROUTES.FORGOT_PASSWORD} className="small">Forgot password?</Link>
          </div>
          <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
