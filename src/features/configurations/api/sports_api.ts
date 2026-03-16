import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type { SportDto } from './sports_types'

export const sportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listSports: builder.query<GenericResponse<SportDto[]>, void>({
      query: () => '/admin/sports',
      providesTags: ['Sports'],
    }),
    getSport: builder.query<GenericResponse<SportDto>, number>({
      query: (id) => `/admin/sports/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Sports', id }],
    }),
    createSport: builder.mutation<GenericResponse<SportDto>, { name: string; image: File }>({
      query: ({ name, image }) => {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('image', image)
        return {
          url: '/admin/sports',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['Sports'],
    }),
    updateSport: builder.mutation<GenericResponse<SportDto>, { sportId: number; name: string; image?: File }>({
      query: ({ sportId, name, image }) => {
        const formData = new FormData()
        formData.append('name', name)
        if (image) {
          formData.append('image', image)
        }
        return {
          url: `/admin/sports/${sportId}`,
          method: 'PUT',
          body: formData,
        }
      },
      invalidatesTags: ['Sports'],
    }),
    toggleSportStatus: builder.mutation<GenericResponse<null>, { sportId: number; active: boolean }>({
      query: ({ sportId, active }) => ({
        url: `/admin/sports/${sportId}/status`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['Sports'],
    }),
    deleteSport: builder.mutation<GenericResponse<null>, number>({
      query: (sportId) => ({
        url: `/admin/sports/${sportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sports'],
    }),
  }),
})

export const {
  useListSportsQuery,
  useGetSportQuery,
  useCreateSportMutation,
  useUpdateSportMutation,
  useToggleSportStatusMutation,
  useDeleteSportMutation,
} = sportsApi

