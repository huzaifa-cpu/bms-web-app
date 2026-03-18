import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { AdminProfileResponse, UpdateProfilePayload, ChangePasswordRequest } from './profile_types'

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.mutation<GenericResponse<AdminProfileResponse>, void>({
      query: () => ({
        url: '/admin/profile/get',
        method: 'POST',
      }),
    }),
    updateProfile: builder.mutation<GenericResponse<AdminProfileResponse>, UpdateProfilePayload>({
      query: (payload) => {
        const formData = new FormData()
        // Add JSON data as a blob with application/json content type
        formData.append('data', new Blob([JSON.stringify(payload.data)], { type: 'application/json' }))
        // Add avatar file if present
        if (payload.avatar) {
          formData.append('avatar', payload.avatar)
        }
        return {
          url: '/admin/profile',
          method: 'POST',
          body: formData,
          // Empty headers object prevents RTK Query from setting Content-Type
          // Browser will set correct multipart/form-data with boundary
          headers: {},
        }
      },
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation<GenericResponse<null>, ChangePasswordRequest>({
      query: (request) => ({
        url: '/admin/profile/change-password',
        method: 'POST',
        body: request,
      }),
    }),
  }),
})

export const { useGetProfileMutation, useUpdateProfileMutation, useChangePasswordMutation } = profileApi
