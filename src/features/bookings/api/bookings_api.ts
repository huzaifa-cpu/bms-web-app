import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { BookingDto, AdminForceCancelRequest, ListBookingsParams, CreateWalkInBookingRequest } from './bookings_types'

export const bookingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooking: builder.mutation<GenericResponse<BookingDto>, number>({
      query: (bookingId) => ({
        url: `/admin/bookings/${bookingId}`,
        method: 'POST',
      }),
    }),
    listBookings: builder.mutation<GenericResponse<BookingDto[]>, ListBookingsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.date) searchParams.set('date', params.date)
        const qs = searchParams.toString()
        return {
          url: `/admin/bookings${qs ? `?${qs}` : ''}`,
          method: 'POST',
        }
      },
    }),
    forceCancelBooking: builder.mutation<GenericResponse<BookingDto>, { bookingId: number; request: AdminForceCancelRequest }>({
      query: ({ bookingId, request }) => ({
        url: `/admin/bookings/${bookingId}/force-cancel`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Bookings'],
    }),
    createWalkInBooking: builder.mutation<GenericResponse<BookingDto>, CreateWalkInBookingRequest>({
      query: (request) => ({
        url: '/admin/bookings/walk-in',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
})

export const {
  useGetBookingMutation,
  useListBookingsMutation,
  useForceCancelBookingMutation,
  useCreateWalkInBookingMutation,
} = bookingsApi
