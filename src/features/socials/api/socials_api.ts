import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  TeamDto,
  GameDto,
  GameFormatDto,
  CommunityGroupDto,
  SpringPage,
  ListSocialsParams,
  ListGamesParams,
  CreateTeamRequest,
  CreateGroupRequest,
  CreateGameRequest,
} from './socials_types'

export const socialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Teams ── */
    listTeams: builder.query<GenericResponse<SpringPage<TeamDto>>, ListSocialsParams>({
      query: ({ active, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (active !== undefined) params.append('active', String(active))
        params.append('page', String(page))
        params.append('size', String(size))
        return `/admin/social/teams?${params.toString()}`
      },
      providesTags: ['Teams'],
    }),
    getTeam: builder.query<GenericResponse<TeamDto>, number>({
      query: (teamId) => `/admin/social/teams/${teamId}`,
      providesTags: (_r, _e, id) => [{ type: 'Teams', id }],
    }),
    createTeam: builder.mutation<GenericResponse<TeamDto>, { request: CreateTeamRequest; image?: File }>({
      query: ({ request, image }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        if (image) {
          body.append('image', image)
        }
        return {
          url: '/admin/social/teams',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Teams'],
    }),
    updateTeam: builder.mutation<GenericResponse<TeamDto>, { teamId: number; request: CreateTeamRequest; image?: File }>({
      query: ({ teamId, request, image }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        if (image) {
          body.append('image', image)
        }
        return {
          url: `/admin/social/teams/${teamId}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: ['Teams'],
    }),
    toggleTeamActive: builder.mutation<GenericResponse<TeamDto>, { teamId: number; active: boolean }>({
      query: ({ teamId, active }) => ({
        url: `/admin/social/teams/${teamId}/active`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['Teams'],
    }),

    /* ── Games ── */
    listGameFormats: builder.query<GenericResponse<GameFormatDto[]>, void>({
      query: () => '/admin/social/games/formats',
    }),
    listGames: builder.query<GenericResponse<SpringPage<GameDto>>, ListGamesParams>({
      query: ({ status, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        params.append('page', String(page))
        params.append('size', String(size))
        return `/admin/social/games?${params.toString()}`
      },
      providesTags: ['Games'],
    }),
    getGame: builder.query<GenericResponse<GameDto>, number>({
      query: (gameId) => `/admin/social/games/${gameId}`,
      providesTags: (_r, _e, id) => [{ type: 'Games', id }],
    }),
    createGame: builder.mutation<GenericResponse<GameDto>, CreateGameRequest>({
      query: (request) => ({
        url: '/admin/social/games',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Games'],
    }),
    updateGame: builder.mutation<GenericResponse<GameDto>, { gameId: number; request: CreateGameRequest }>({
      query: ({ gameId, request }) => ({
        url: `/admin/social/games/${gameId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Games'],
    }),
    cancelGame: builder.mutation<GenericResponse<GameDto>, number>({
      query: (gameId) => ({
        url: `/admin/social/games/${gameId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Games'],
    }),
    rescheduleGame: builder.mutation<GenericResponse<GameDto>, { gameId: number; request: CreateGameRequest }>({
      query: ({ gameId, request }) => ({
        url: `/admin/social/games/${gameId}/reschedule`,
        method: 'PATCH',
        body: request,
      }),
      invalidatesTags: ['Games'],
    }),

    /* ── Groups ── */
    listGroups: builder.query<GenericResponse<SpringPage<CommunityGroupDto>>, ListSocialsParams>({
      query: ({ active, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (active !== undefined) params.append('active', String(active))
        params.append('page', String(page))
        params.append('size', String(size))
        return `/admin/social/groups?${params.toString()}`
      },
      providesTags: ['Groups'],
    }),
    getGroup: builder.query<GenericResponse<CommunityGroupDto>, number>({
      query: (groupId) => `/admin/social/groups/${groupId}`,
      providesTags: (_r, _e, id) => [{ type: 'Groups', id }],
    }),
    createGroup: builder.mutation<GenericResponse<CommunityGroupDto>, { request: CreateGroupRequest; image?: File }>({
      query: ({ request, image }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        if (image) {
          body.append('image', image)
        }
        return {
          url: '/admin/social/groups',
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Groups'],
    }),
    updateGroup: builder.mutation<GenericResponse<CommunityGroupDto>, { groupId: number; request: CreateGroupRequest; image?: File }>({
      query: ({ groupId, request, image }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        if (image) {
          body.append('image', image)
        }
        return {
          url: `/admin/social/groups/${groupId}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: ['Groups'],
    }),
    toggleGroupActive: builder.mutation<GenericResponse<CommunityGroupDto>, { groupId: number; active: boolean }>({
      query: ({ groupId, active }) => ({
        url: `/admin/social/groups/${groupId}/active`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['Groups'],
    }),
  }),
})

export const {
  useListTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useToggleTeamActiveMutation,
  useListGameFormatsQuery,
  useListGamesQuery,
  useGetGameQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useCancelGameMutation,
  useRescheduleGameMutation,
  useListGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useToggleGroupActiveMutation,
} = socialsApi
