import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  SettlementDto,
  SettlementItemDto,
  SettlementSummaryDto,
  SpringPage,
  ListSettlementsParams,
  MarkSettlementFailedRequest,
} from './settlements_types'

export const settlementsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listSettlements: builder.mutation<GenericResponse<SpringPage<SettlementDto>>, ListSettlementsParams | void>({
      query: (params) => {
        const sp = new URLSearchParams()
        if (params?.status) sp.set('status', params.status)
        if (params?.type) sp.set('type', params.type)
        if (params?.providerUserId) sp.set('providerUserId', String(params.providerUserId))
        sp.set('page', String(params?.page ?? 0))
        sp.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/settlements?${sp.toString()}`,
          method: 'POST',
        }
      },
    }),

    getSettlementSummary: builder.mutation<GenericResponse<SettlementSummaryDto>, { type?: string } | void>({
      query: (params) => {
        const sp = new URLSearchParams()
        if (params?.type) sp.set('type', params.type)
        return {
          url: `/admin/settlements/summary?${sp.toString()}`,
          method: 'POST',
        }
      },
    }),

    getSettlement: builder.mutation<GenericResponse<SettlementDto>, number>({
      query: (id) => ({
        url: `/admin/settlements/${id}`,
        method: 'POST',
      }),
    }),

    getSettlementItems: builder.mutation<GenericResponse<SettlementItemDto[]>, number>({
      query: (id) => ({
        url: `/admin/settlements/${id}/items`,
        method: 'POST',
      }),
    }),

    approveSettlement: builder.mutation<GenericResponse<SettlementDto>, number>({
      query: (id) => ({
        url: `/admin/settlements/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Settlements'],
    }),

    markSettlementPaid: builder.mutation<GenericResponse<SettlementDto>, number>({
      query: (id) => ({
        url: `/admin/settlements/${id}/mark-paid`,
        method: 'POST',
      }),
      invalidatesTags: ['Settlements'],
    }),

    markSettlementFailed: builder.mutation<GenericResponse<SettlementDto>, { id: number; body: MarkSettlementFailedRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/settlements/${id}/mark-failed`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settlements'],
    }),

    generateCommission: builder.mutation<GenericResponse<void>, void>({
      query: () => ({
        url: '/admin/settlements/generate/commission',
        method: 'POST',
      }),
      invalidatesTags: ['Settlements'],
    }),

    generatePeriod: builder.mutation<GenericResponse<void>, void>({
      query: () => ({
        url: '/admin/settlements/generate/period',
        method: 'POST',
      }),
      invalidatesTags: ['Settlements'],
    }),
  }),
})

export const {
  useListSettlementsMutation,
  useGetSettlementSummaryMutation,
  useGetSettlementMutation,
  useGetSettlementItemsMutation,
  useApproveSettlementMutation,
  useMarkSettlementPaidMutation,
  useMarkSettlementFailedMutation,
  useGenerateCommissionMutation,
  useGeneratePeriodMutation,
} = settlementsApi
