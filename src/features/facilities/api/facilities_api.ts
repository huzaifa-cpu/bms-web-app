import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  FacilityDto,
  AdminFacilityDto,
  AdminFacilityDecisionRequest,
  AdminCreateFacilityRequest,
  AdminUpdateFacilityRequest,
  ListFacilitiesParams,
  SpringPage,
  SportDto,
} from './facilities_types'

export const facilitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Approval endpoints ── */
    listPendingFacilities: builder.query<GenericResponse<FacilityDto[]>, void>({
      query: () => '/admin/facilities/pending',
      providesTags: ['Facilities'],
    }),
    approveFacility: builder.mutation<GenericResponse<FacilityDto>, { facilityId: number; request?: AdminFacilityDecisionRequest }>({
      query: ({ facilityId, request }) => ({
        url: `/admin/facilities/${facilityId}/approve`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Facilities'],
    }),
    rejectFacility: builder.mutation<GenericResponse<FacilityDto>, { facilityId: number; request?: AdminFacilityDecisionRequest }>({
      query: ({ facilityId, request }) => ({
        url: `/admin/facilities/${facilityId}/reject`,
        method: 'POST',
        body: request ?? {},
      }),
      invalidatesTags: ['Facilities'],
    }),

    /* ── Facility Management CRUD endpoints ── */
    listFacilities: builder.query<GenericResponse<SpringPage<AdminFacilityDto>>, ListFacilitiesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.approvalState && params.approvalState.length > 0) {
          params.approvalState.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/facilities/manage?${searchParams.toString()}`
      },
      providesTags: ['Facilities'],
    }),
    getFacility: builder.query<GenericResponse<AdminFacilityDto>, number>({
      query: (id) => `/admin/facilities/manage/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Facilities', id }],
    }),
    listSports: builder.query<GenericResponse<SportDto[]>, void>({
      query: () => '/admin/sports',
    }),
    createFacility: builder.mutation<GenericResponse<AdminFacilityDto>, { request: AdminCreateFacilityRequest; images: File[] }>({
      query: ({ request, images }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        images.forEach((file) => {
          body.append('images', file)
        })
        return {
          url: '/admin/facilities/manage',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Facilities'],
    }),
    updateFacility: builder.mutation<GenericResponse<AdminFacilityDto>, { facilityId: number; request: AdminUpdateFacilityRequest; newImages: File[] }>({
      query: ({ facilityId, request, newImages }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        newImages.forEach((file) => {
          body.append('images', file)
        })
        return {
          url: `/admin/facilities/manage/${facilityId}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: ['Facilities'],
    }),
    toggleFacilityActive: builder.mutation<GenericResponse<null>, { facilityId: number; active: boolean }>({
      query: ({ facilityId, active }) => ({
        url: `/admin/facilities/manage/${facilityId}/active`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['Facilities'],
    }),
    listFacilitiesByVenue: builder.query<GenericResponse<AdminFacilityDto[]>, number>({
      query: (venueId) => `/admin/facilities/manage/by-venue/${venueId}`,
      providesTags: ['Facilities'],
    }),
  }),
})

export const {
  useListPendingFacilitiesQuery,
  useApproveFacilityMutation,
  useRejectFacilityMutation,
  useListFacilitiesQuery,
  useGetFacilityQuery,
  useListSportsQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useToggleFacilityActiveMutation,
  useListFacilitiesByVenueQuery,
} = facilitiesApi
