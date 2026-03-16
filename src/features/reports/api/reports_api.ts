import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { ReportDataDto } from './reports_types'

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.query<GenericResponse<ReportDataDto>, { reportType: string }>({
      query: ({ reportType }) => `/admin/reports?reportType=${reportType}`,
      providesTags: ['Reports'],
    }),
  }),
})

export const { useLazyGenerateReportQuery } = reportsApi
