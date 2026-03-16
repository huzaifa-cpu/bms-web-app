import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  BroadcastNotificationRequest,
  ListNotificationHistoryParams,
  NotificationDto,
  SpringPage,
} from './notifications_types'

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    broadcastNotification: builder.mutation<GenericResponse<null>, BroadcastNotificationRequest>({
      query: (request) => ({
        url: '/admin/notifications/broadcast',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Notifications'],
    }),

    listNotificationHistory: builder.query<SpringPage<NotificationDto>, ListNotificationHistoryParams>({
      query: (params) => ({
        url: '/admin/notifications/history',
        params: {
          ...(params.status && { status: params.status }),
          ...(params.channel && { channel: params.channel }),
          page: params.page ?? 0,
          size: params.size ?? 10,
        },
      }),
      transformResponse: (response: GenericResponse<SpringPage<NotificationDto>>) => response.data,
      providesTags: ['Notifications'],
    }),

    getNotification: builder.query<NotificationDto, number>({
      query: (id) => `/admin/notifications/history/${id}`,
      transformResponse: (response: GenericResponse<NotificationDto>) => response.data,
      providesTags: ['Notifications'],
    }),
  }),
})

export const {
  useBroadcastNotificationMutation,
  useListNotificationHistoryQuery,
  useGetNotificationQuery,
} = notificationsApi
