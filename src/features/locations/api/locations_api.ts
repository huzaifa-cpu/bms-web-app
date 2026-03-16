import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  VenueDto,
  AdminDecisionRequest,
  ListLocationsParams,
  AdminCreateLocationRequest,
  AdminUpdateLocationRequest,
  SpringPage,
} from './locations_types'

export const locationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Approval endpoints ── */
    listPendingVenues: builder.query<GenericResponse<VenueDto[]>, void>({
      query: () => '/admin/venues/pending',
      providesTags: ['Locations'],
    }),
    approveVenue: builder.mutation<GenericResponse<VenueDto>, { venueId: number; request?: AdminDecisionRequest }>({
      query: ({ venueId, request }) => ({
        url: `/admin/venues/${venueId}/approve`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Locations'],
    }),
    rejectVenue: builder.mutation<GenericResponse<VenueDto>, { venueId: number; request?: AdminDecisionRequest }>({
      query: ({ venueId, request }) => ({
        url: `/admin/venues/${venueId}/reject`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Locations'],
    }),

    /* ── Location Management CRUD endpoints ── */
    listLocations: builder.query<GenericResponse<SpringPage<VenueDto>>, ListLocationsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.approvalState && params.approvalState.length > 0) {
          params.approvalState.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/locations?${searchParams.toString()}`
      },
      providesTags: ['Locations'],
    }),
    getLocation: builder.query<GenericResponse<VenueDto>, number>({
      query: (id) => `/admin/locations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Locations', id }],
    }),
    listLocationsByProvider: builder.query<GenericResponse<VenueDto[]>, number>({
      query: (providerUserId) => `/admin/locations/by-provider/${providerUserId}`,
      providesTags: ['Locations'],
    }),
    createLocation: builder.mutation<GenericResponse<VenueDto>, AdminCreateLocationRequest>({
      query: (request) => ({
        url: '/admin/locations',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocation: builder.mutation<GenericResponse<VenueDto>, { locationId: number; request: AdminUpdateLocationRequest }>({
      query: ({ locationId, request }) => ({
        url: `/admin/locations/${locationId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Locations'],
    }),
    toggleLocationActive: builder.mutation<GenericResponse<null>, { locationId: number; active: boolean }>({
      query: ({ locationId, active }) => ({
        url: `/admin/locations/${locationId}/active`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['Locations'],
    }),
  }),
})

export const {
  useListPendingVenuesQuery,
  useApproveVenueMutation,
  useRejectVenueMutation,
  useListLocationsQuery,
  useGetLocationQuery,
  useListLocationsByProviderQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useToggleLocationActiveMutation,
} = locationsApi
