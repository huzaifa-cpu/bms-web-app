import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  AdminUserDto,
  CreateUserPayload,
  UpdateUserPayload,
  ListUsersParams,
  SpringPage,
} from './users_types'

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<GenericResponse<SpringPage<AdminUserDto>>, ListUsersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/users?${searchParams.toString()}`
      },
      providesTags: ['Users'],
    }),
    getUser: builder.query<GenericResponse<AdminUserDto>, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    createUser: builder.mutation<GenericResponse<AdminUserDto>, CreateUserPayload>({
      query: (payload) => {
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(payload.data)], { type: 'application/json' }))
        if (payload.avatar) {
          formData.append('avatar', payload.avatar)
        }
        return {
          url: '/admin/users',
          method: 'POST',
          body: formData,
          headers: {},
        }
      },
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<GenericResponse<AdminUserDto>, UpdateUserPayload>({
      query: (payload) => {
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(payload.data)], { type: 'application/json' }))
        if (payload.avatar) {
          formData.append('avatar', payload.avatar)
        }
        return {
          url: `/admin/users/${payload.userId}`,
          method: 'PUT',
          body: formData,
          headers: {},
        }
      },
      invalidatesTags: ['Users'],
    }),
    toggleUserStatus: builder.mutation<GenericResponse<null>, { userId: number; status: string }>({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
} = usersApi
