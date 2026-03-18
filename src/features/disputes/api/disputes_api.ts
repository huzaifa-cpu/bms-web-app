import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  DisputeDto,
  DisputeDetailsDto,
  AssignDisputeRequest,
  UpdateDisputeStatusRequest,
  ResolveDisputeRequest,
  ListDisputesParams,
  CreateDisputeRequest,
  CloseDisputeRequest,
} from './disputes_types'

export const disputesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listDisputes: builder.mutation<GenericResponse<DisputeDto[]>, ListDisputesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.type) searchParams.set('type', params.type)
        if (params?.assignedTo) searchParams.set('assignedTo', String(params.assignedTo))
        const qs = searchParams.toString()
        return {
          url: `/admin/disputes${qs ? `?${qs}` : ''}`,
          method: 'POST',
        }
      },
    }),
    getDisputeDetails: builder.mutation<GenericResponse<DisputeDetailsDto>, { disputeId: number; adminUserId: number }>({
      query: ({ disputeId, adminUserId }) => ({
        url: `/admin/disputes/${disputeId}?adminUserId=${adminUserId}`,
        method: 'POST',
      }),
    }),
    createDispute: builder.mutation<GenericResponse<DisputeDto>, CreateDisputeRequest>({
      query: (request) => ({
        url: `/admin/disputes/create`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Disputes'],
    }),
    assignDispute: builder.mutation<GenericResponse<DisputeDto>, { disputeId: number; request: AssignDisputeRequest }>({
      query: ({ disputeId, request }) => ({
        url: `/admin/disputes/${disputeId}/assign`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Disputes'],
    }),
    updateDisputeStatus: builder.mutation<GenericResponse<DisputeDto>, { disputeId: number; request: UpdateDisputeStatusRequest }>({
      query: ({ disputeId, request }) => ({
        url: `/admin/disputes/${disputeId}/status`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Disputes'],
    }),
    resolveDispute: builder.mutation<GenericResponse<DisputeDto>, { disputeId: number; request: ResolveDisputeRequest }>({
      query: ({ disputeId, request }) => ({
        url: `/admin/disputes/${disputeId}/resolve`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Disputes'],
    }),
    closeDispute: builder.mutation<GenericResponse<DisputeDto>, { disputeId: number; request: CloseDisputeRequest }>({
      query: ({ disputeId, request }) => ({
        url: `/admin/disputes/${disputeId}/status`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Disputes'],
    }),
  }),
})

export const {
  useListDisputesMutation,
  useGetDisputeDetailsMutation,
  useCreateDisputeMutation,
  useAssignDisputeMutation,
  useUpdateDisputeStatusMutation,
  useResolveDisputeMutation,
  useCloseDisputeMutation,
} = disputesApi
