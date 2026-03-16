import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  AdminEmployeeDto,
  AdminUpdateEmployeeRequest,
  ListEmployeesParams,
  SpringPage,
} from './employees_types'

export const employeesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listEmployees: builder.query<GenericResponse<SpringPage<AdminEmployeeDto>>, ListEmployeesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/employees?${searchParams.toString()}`
      },
      providesTags: ['Employees'],
    }),
    getEmployee: builder.query<GenericResponse<AdminEmployeeDto>, number>({
      query: (id) => `/admin/employees/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Employees', id }],
    }),
    updateEmployee: builder.mutation<GenericResponse<AdminEmployeeDto>, { employeeId: number; request: AdminUpdateEmployeeRequest }>({
      query: ({ employeeId, request }) => ({
        url: `/admin/employees/${employeeId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Employees'],
    }),
    toggleEmployeeStatus: builder.mutation<GenericResponse<null>, { employeeId: number; status: string }>({
      query: ({ employeeId, status }) => ({
        url: `/admin/employees/${employeeId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Employees'],
    }),
  }),
})

export const {
  useListEmployeesQuery,
  useGetEmployeeQuery,
  useUpdateEmployeeMutation,
  useToggleEmployeeStatusMutation,
} = employeesApi
