import { apiSlice } from '../../../core/api/api_slices'
import type { DashboardStatsDto } from './dashboard_types'

interface GenericResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.mutation<DashboardStatsDto, void>({
      query: () => ({
        url: '/admin/dashboard/stats',
        method: 'POST',
      }),
      transformResponse: (response: GenericResponse<DashboardStatsDto>) => response.data,
    }),
  }),
})

export const { useGetDashboardStatsMutation } = dashboardApi
