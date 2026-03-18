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
    listRoles: builder.mutation<GenericResponse<AdminRoleDto[]>, void>({
      query: () => ({
        url: '/admin/roles/list',
        method: 'POST',
      }),
    }),
    getRole: builder.mutation<GenericResponse<AdminRoleDto>, number>({
      query: (id) => ({
        url: `/admin/roles/${id}/get`,
        method: 'POST',
      }),
    }),
    getFeatures: builder.mutation<GenericResponse<FeaturePermissionsDto[]>, void>({
      query: () => ({
        url: '/admin/roles/features',
        method: 'POST',
      }),
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
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Roles'],
    }),
    toggleRoleStatus: builder.mutation<GenericResponse<null>, { roleId: number; status: RoleStatus }>({
      query: ({ roleId, status }) => ({
        url: `/admin/roles/${roleId}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
})

export const {
  useListRolesMutation,
  useGetRoleMutation,
  useGetFeaturesMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useToggleRoleStatusMutation,
} = rolesApi
