import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTES } from '../../../core/constants/routes'
import { useForgotPasswordSendOtpMutation } from '../api/auth_api'
import { getDeviceId } from '../../../core/utils/device_utils'
import { mapToAppError } from '../../../core/errors/error_mapper'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [sendOtp, { isLoading, isSuccess, isError, error, data, reset }] =
    useForgotPasswordSendOtpMutation()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Reset mutation state on mount to clear any stale state from previous attempts
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (formData: FormData) => {
    const deviceId = getDeviceId()
    await sendOtp({
      identifier: formData.email,
      deviceId,
      role: 'ADMIN',
    })
  }

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      const identifier = getValues('email')
      // Navigate to OTP page with state
      setTimeout(() => {
        navigate(ROUTES.RESET_OTP, {
          state: {
            identifier,
            verificationRequestId: data.data.verificationRequestId,
          },
        })
      }, 1500)
    }
  }, [isSuccess, data, navigate, getValues])

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
    isSuccess && data?.success ? 'OTP sent to your email! Redirecting...' : null

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h4 className="mb-4 text-center">Forgot Password</h4>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {!successMessage && (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="your@email.com"
                isInvalid={!!errors.email}
                disabled={isLoading}
                {...register('email')}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Form>
        )}
        <div className="text-center mt-3">
          <Link to={ROUTES.LOGIN} className="small">
            Back to login
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}
