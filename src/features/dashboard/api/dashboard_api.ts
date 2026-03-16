import { apiSlice } from '../../../core/api/api_slices'
import type { DashboardStatsDto } from './dashboard_types'

interface GenericResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsDto, void>({
      query: () => '/admin/dashboard/stats',
      transformResponse: (response: GenericResponse<DashboardStatsDto>) => response.data,
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardStatsQuery } = dashboardApi
