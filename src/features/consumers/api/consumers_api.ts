import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  AdminConsumerDto,
  AdminUpdateConsumerRequest,
  ListConsumersParams,
  SpringPage,
} from './consumers_types'

export const consumersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listConsumers: builder.mutation<GenericResponse<SpringPage<AdminConsumerDto>>, ListConsumersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/consumers?${searchParams.toString()}`,
          method: 'POST',
        }
      },
    }),
    getConsumer: builder.mutation<GenericResponse<AdminConsumerDto>, number>({
      query: (id) => ({
        url: `/admin/consumers/${id}/get`,
        method: 'POST',
      }),
    }),
    updateConsumer: builder.mutation<GenericResponse<AdminConsumerDto>, { consumerId: number; request: AdminUpdateConsumerRequest }>({
      query: ({ consumerId, request }) => ({
        url: `/admin/consumers/${consumerId}`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Consumers'],
    }),
    toggleConsumerStatus: builder.mutation<GenericResponse<null>, { consumerId: number; status: string }>({
      query: ({ consumerId, status }) => ({
        url: `/admin/consumers/${consumerId}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Consumers'],
    }),
  }),
})

export const {
  useListConsumersMutation,
  useGetConsumerMutation,
  useUpdateConsumerMutation,
  useToggleConsumerStatusMutation,
} = consumersApi
