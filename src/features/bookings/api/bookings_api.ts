import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { BookingDto, AdminForceCancelRequest, ListBookingsParams, CreateWalkInBookingRequest } from './bookings_types'

export const bookingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooking: builder.query<GenericResponse<BookingDto>, number>({
      query: (bookingId) => `/admin/bookings/${bookingId}`,
      providesTags: (_result, _error, bookingId) => [{ type: 'Bookings', id: bookingId }],
    }),
    listBookings: builder.query<GenericResponse<BookingDto[]>, ListBookingsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.date) searchParams.set('date', params.date)
        const qs = searchParams.toString()
        return `/admin/bookings${qs ? `?${qs}` : ''}`
      },
      providesTags: ['Bookings'],
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
  useGetBookingQuery,
  useListBookingsQuery,
  useForceCancelBookingMutation,
  useCreateWalkInBookingMutation,
} = bookingsApi
