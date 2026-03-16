/**
 * Login request payload matching backend LoginRequest.java
 */
export interface LoginRequest {
  identifier: string
  password: string
  deviceId: string
}

/**
 * Logout request payload matching backend LogoutRequest.java
 */
export interface LogoutRequest {
  refreshToken: string
  deviceId: string
}

/**
 * Auth response from backend matching AuthResponse.java
 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: string
  expiresInSeconds: number
  userId: number
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE'
  permissions: Record<string, string[]>
  nextStep: string | null
}

/**
 * Generic API response wrapper matching GenericResponse.java
 */
export interface LoginApiResponse {
  success: boolean
  successMessage?: string
  errorMessage?: string
  status: number
  data: AuthResponse
}

/**
 * Forgot password send OTP request matching ForgotPasswordSendOtpRequest.java
 */
export interface ForgotPasswordSendOtpRequest {
  identifier: string
  deviceId: string
  role: string
}

/**
 * Forgot password send OTP response matching ForgotPasswordSendOtpResponse.java
 */
export interface ForgotPasswordSendOtpResponse {
  verificationRequestId: string
  message: string
}

/**
 * Forgot password verify OTP and reset request matching ForgotPasswordVerifyOtpRequest.java
 */
export interface ForgotPasswordResetRequest {
  identifier: string
  verificationRequestId: string
  otp: string
  newPassword: string
  deviceId: string
  role: string
}

/**
 * Forgot password reset response matching ForgotPasswordResetResponse.java
 */
export interface ForgotPasswordResetResponse {
  success: boolean
  message: string
  userId: number
}

