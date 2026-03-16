import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  AdminRoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleStatus,
  FeaturePermissionsDto,
} from './roles_types'

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listRoles: builder.query<GenericResponse<AdminRoleDto[]>, void>({
      query: () => '/admin/roles',
      providesTags: ['Roles'],
    }),
    getRole: builder.query<GenericResponse<AdminRoleDto>, number>({
      query: (id) => `/admin/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
    }),
    getFeatures: builder.query<GenericResponse<FeaturePermissionsDto[]>, void>({
      query: () => '/admin/roles/features',
    }),
    createRole: builder.mutation<GenericResponse<AdminRoleDto>, CreateRoleRequest>({
      query: (request) => ({
        url: '/admin/roles',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<GenericResponse<AdminRoleDto>, { roleId: number; request: UpdateRoleRequest }>({
      query: ({ roleId, request }) => ({
        url: `/admin/roles/${roleId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Roles'],
    }),
    toggleRoleStatus: builder.mutation<GenericResponse<null>, { roleId: number; status: RoleStatus }>({
      query: ({ roleId, status }) => ({
        url: `/admin/roles/${roleId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
})

export const {
  useListRolesQuery,
  useGetRoleQuery,
  useGetFeaturesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useToggleRoleStatusMutation,
} = rolesApi
