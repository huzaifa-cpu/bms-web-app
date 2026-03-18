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

    listNotificationHistory: builder.mutation<SpringPage<NotificationDto>, ListNotificationHistoryParams>({
      query: (params) => ({
        url: '/admin/notifications/history',
        method: 'POST',
        params: {
          ...(params.status && { status: params.status }),
          ...(params.channel && { channel: params.channel }),
          page: params.page ?? 0,
          size: params.size ?? 10,
        },
      }),
      transformResponse: (response: GenericResponse<SpringPage<NotificationDto>>) => response.data,
    }),

    getNotification: builder.mutation<NotificationDto, number>({
      query: (id) => ({
        url: `/admin/notifications/history/${id}`,
        method: 'POST',
      }),
      transformResponse: (response: GenericResponse<NotificationDto>) => response.data,
    }),
  }),
})

export const {
  useBroadcastNotificationMutation,
  useListNotificationHistoryMutation,
  useGetNotificationMutation,
} = notificationsApi
