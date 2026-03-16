import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { ROUTES } from '../../../core/constants/routes'
import { useResetPasswordMutation } from '../api/auth_api'
import { getDeviceId } from '../../../core/utils/device_utils'
import { mapToAppError } from '../../../core/errors/error_mapper'

const schema = z
  .object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

interface LocationState {
  identifier: string
  verificationRequestId: string
}

export default function ResetOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [resetPassword, { isLoading, isSuccess, isError, error, data, reset }] =
    useResetPasswordMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Reset mutation state on mount to clear any stale state from previous attempts
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redirect if no state (user navigated directly)
  useEffect(() => {
    if (!state?.identifier || !state?.verificationRequestId) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
    }
  }, [state, navigate])

  const onSubmit = async (formData: FormData) => {
    if (!state) return

    const deviceId = getDeviceId()
    await resetPassword({
      identifier: state.identifier,
      verificationRequestId: state.verificationRequestId,
      otp: formData.otp,
      newPassword: formData.newPassword,
      deviceId,
      role: 'ADMIN',
    })
  }

  useEffect(() => {
    if (isSuccess && data?.success) {
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true })
      }, 2000)
    }
  }, [isSuccess, data, navigate])

  const getErrorMessage = (): string | null => {
    if (!isError || !error) return null

    const apiError = error as { data?: { errorMessage?: string; message?: string } }
    if (apiError.data?.errorMessage) {
      return apiError.data.errorMessage
    }
    if (apiError.data?.message) {
      return apiError.data.message
    }

    const appError = mapToAppError(error)
    return appError.message
  }

  const errorMessage = getErrorMessage()
  const successMessage =
    isSuccess && data?.success
      ? 'Password reset successful! Redirecting to login...'
      : null

  // Don't render form if no state
  if (!state?.identifier || !state?.verificationRequestId) {
    return null
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h4 className="mb-4 text-center">Reset Password</h4>
        <p className="text-muted text-center small mb-4">
          Enter the 6-digit code sent to your email and set your new password.
        </p>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {!successMessage && (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>OTP Code</Form.Label>
              <Form.Control
                type="text"
                maxLength={6}
                placeholder="123456"
                isInvalid={!!errors.otp}
                disabled={isLoading}
                {...register('otp')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.otp?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  isInvalid={!!errors.newPassword}
                  disabled={isLoading}
                  {...register('newPassword')}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword?.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  isInvalid={!!errors.confirmPassword}
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword?.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        )}
        <div className="text-center mt-3">
          <Link to={ROUTES.FORGOT_PASSWORD} className="small">
            Resend OTP
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}
