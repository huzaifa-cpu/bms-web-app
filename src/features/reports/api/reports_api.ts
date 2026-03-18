import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { ReportDataDto } from './reports_types'

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.mutation<GenericResponse<ReportDataDto>, { reportType: string }>({
      query: ({ reportType }) => ({
        url: `/admin/reports?reportType=${reportType}`,
        method: 'POST',
      }),
    }),
  }),
})

export const { useGenerateReportMutation } = reportsApi
