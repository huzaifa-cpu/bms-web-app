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
    /* -- Approval endpoints -- */
    listPendingFacilities: builder.mutation<GenericResponse<FacilityDto[]>, void>({
      query: () => ({
        url: '/admin/facilities/pending',
        method: 'POST',
      }),
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

    /* -- Facility Management CRUD endpoints -- */
    listFacilities: builder.mutation<GenericResponse<SpringPage<AdminFacilityDto>>, ListFacilitiesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.approvalState && params.approvalState.length > 0) {
          params.approvalState.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/facilities/manage/list?${searchParams.toString()}`,
          method: 'POST',
        }
      },
    }),
    getFacility: builder.mutation<GenericResponse<AdminFacilityDto>, number>({
      query: (id) => ({
        url: `/admin/facilities/manage/${id}/get`,
        method: 'POST',
      }),
    }),
    listSports: builder.mutation<GenericResponse<SportDto[]>, void>({
      query: () => ({
        url: '/admin/sports',
        method: 'POST',
      }),
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
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Facilities'],
    }),
    toggleFacilityActive: builder.mutation<GenericResponse<null>, { facilityId: number; active: boolean }>({
      query: ({ facilityId, active }) => ({
        url: `/admin/facilities/manage/${facilityId}/active`,
        method: 'POST',
        body: { active },
      }),
      invalidatesTags: ['Facilities'],
    }),
    listFacilitiesByLocation: builder.mutation<GenericResponse<AdminFacilityDto[]>, number>({
      query: (locationId) => ({
        url: `/admin/facilities/manage/by-location/${locationId}`,
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useListPendingFacilitiesMutation,
  useApproveFacilityMutation,
  useRejectFacilityMutation,
  useListFacilitiesMutation,
  useGetFacilityMutation,
  useListSportsMutation,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useToggleFacilityActiveMutation,
  useListFacilitiesByLocationMutation,
} = facilitiesApi
