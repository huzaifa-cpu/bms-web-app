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
    listConsumers: builder.query<GenericResponse<SpringPage<AdminConsumerDto>>, ListConsumersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/consumers?${searchParams.toString()}`
      },
      providesTags: ['Consumers'],
    }),
    getConsumer: builder.query<GenericResponse<AdminConsumerDto>, number>({
      query: (id) => `/admin/consumers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Consumers', id }],
    }),
    updateConsumer: builder.mutation<GenericResponse<AdminConsumerDto>, { consumerId: number; request: AdminUpdateConsumerRequest }>({
      query: ({ consumerId, request }) => ({
        url: `/admin/consumers/${consumerId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Consumers'],
    }),
    toggleConsumerStatus: builder.mutation<GenericResponse<null>, { consumerId: number; status: string }>({
      query: ({ consumerId, status }) => ({
        url: `/admin/consumers/${consumerId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Consumers'],
    }),
  }),
})

export const {
  useListConsumersQuery,
  useGetConsumerQuery,
  useUpdateConsumerMutation,
  useToggleConsumerStatusMutation,
} = consumersApi
