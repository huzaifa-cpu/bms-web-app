import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../core/constants/routes'

/**
 * This page is no longer used in the password reset flow.
 * The OTP verification and password reset are now combined in ResetOtpPage.
 * This component redirects to the forgot password page for users who land here directly.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
  }, [navigate])

  return null
}
