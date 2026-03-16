import { apiSlice } from '../../../core/api/api_slices'
import type {
  LoginRequest,
  LoginApiResponse,
  LogoutRequest,
  ForgotPasswordSendOtpRequest,
  ForgotPasswordSendOtpResponse,
  ForgotPasswordResetRequest,
  ForgotPasswordResetResponse,
} from './auth_types'
import type { GenericResponse } from '../../../core/dtos/generic_response'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginApiResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<GenericResponse<null>, LogoutRequest>({
      query: (request) => ({
        url: '/auth/logout',
        method: 'POST',
        body: request,
      }),
    }),
    forgotPasswordSendOtp: builder.mutation<
      GenericResponse<ForgotPasswordSendOtpResponse>,
      ForgotPasswordSendOtpRequest
    >({
      query: (request) => ({
        url: '/auth/password/forgot-otp',
        method: 'POST',
        body: request,
      }),
    }),
    resetPassword: builder.mutation<
      GenericResponse<ForgotPasswordResetResponse>,
      ForgotPasswordResetRequest
    >({
      query: (request) => ({
        url: '/auth/password/reset',
        method: 'POST',
        body: request,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordSendOtpMutation,
  useResetPasswordMutation,
} = authApi

