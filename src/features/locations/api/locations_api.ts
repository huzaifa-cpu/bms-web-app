import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  LocationDto,
  AdminDecisionRequest,
  ListLocationsParams,
  AdminCreateLocationRequest,
  AdminUpdateLocationRequest,
  SpringPage,
} from './locations_types'

export const locationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* -- Approval endpoints -- */
    listPendingLocations: builder.mutation<GenericResponse<LocationDto[]>, void>({
      query: () => ({
        url: '/admin/locations/pending',
        method: 'POST',
      }),
    }),
    approveLocation: builder.mutation<GenericResponse<LocationDto>, { locationId: number; request?: AdminDecisionRequest }>({
      query: ({ locationId, request }) => ({
        url: `/admin/locations/${locationId}/approve`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Locations'],
    }),
    rejectLocation: builder.mutation<GenericResponse<LocationDto>, { locationId: number; request?: AdminDecisionRequest }>({
      query: ({ locationId, request }) => ({
        url: `/admin/locations/${locationId}/reject`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Locations'],
    }),

    /* -- Location Management CRUD endpoints -- */
    listLocations: builder.mutation<GenericResponse<SpringPage<LocationDto>>, ListLocationsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.approvalState && params.approvalState.length > 0) {
          params.approvalState.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/locations/list?${searchParams.toString()}`,
          method: 'POST',
        }
      },
    }),
    getLocation: builder.mutation<GenericResponse<LocationDto>, number>({
      query: (id) => ({
        url: `/admin/locations/${id}/get`,
        method: 'POST',
      }),
    }),
    listLocationsByProvider: builder.mutation<GenericResponse<LocationDto[]>, number>({
      query: (providerUserId) => ({
        url: `/admin/locations/by-provider/${providerUserId}`,
        method: 'POST',
      }),
    }),
    createLocation: builder.mutation<GenericResponse<LocationDto>, AdminCreateLocationRequest>({
      query: (request) => ({
        url: '/admin/locations',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocation: builder.mutation<GenericResponse<LocationDto>, { locationId: number; request: AdminUpdateLocationRequest }>({
      query: ({ locationId, request }) => ({
        url: `/admin/locations/${locationId}`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Locations'],
    }),
    toggleLocationActive: builder.mutation<GenericResponse<null>, { locationId: number; active: boolean }>({
      query: ({ locationId, active }) => ({
        url: `/admin/locations/${locationId}/active`,
        method: 'POST',
        body: { active },
      }),
      invalidatesTags: ['Locations'],
    }),
  }),
})

export const {
  useListPendingLocationsMutation,
  useApproveLocationMutation,
  useRejectLocationMutation,
  useListLocationsMutation,
  useGetLocationMutation,
  useListLocationsByProviderMutation,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useToggleLocationActiveMutation,
} = locationsApi
