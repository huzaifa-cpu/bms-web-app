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
    /* -- Teams -- */
    listTeams: builder.mutation<GenericResponse<SpringPage<TeamDto>>, ListSocialsParams>({
      query: ({ active, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (active !== undefined) params.append('active', String(active))
        params.append('page', String(page))
        params.append('size', String(size))
        return {
          url: `/admin/social/teams/list?${params.toString()}`,
          method: 'POST',
        }
      },
    }),
    getTeam: builder.mutation<GenericResponse<TeamDto>, number>({
      query: (teamId) => ({
        url: `/admin/social/teams/${teamId}/get`,
        method: 'POST',
      }),
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
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Teams'],
    }),
    toggleTeamActive: builder.mutation<GenericResponse<TeamDto>, { teamId: number; active: boolean }>({
      query: ({ teamId, active }) => ({
        url: `/admin/social/teams/${teamId}/active`,
        method: 'POST',
        body: { active },
      }),
      invalidatesTags: ['Teams'],
    }),

    /* -- Games -- */
    listGameFormats: builder.mutation<GenericResponse<GameFormatDto[]>, void>({
      query: () => ({
        url: '/admin/social/games/formats',
        method: 'POST',
      }),
    }),
    listGames: builder.mutation<GenericResponse<SpringPage<GameDto>>, ListGamesParams>({
      query: ({ status, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        params.append('page', String(page))
        params.append('size', String(size))
        return {
          url: `/admin/social/games/list?${params.toString()}`,
          method: 'POST',
        }
      },
    }),
    getGame: builder.mutation<GenericResponse<GameDto>, number>({
      query: (gameId) => ({
        url: `/admin/social/games/${gameId}/get`,
        method: 'POST',
      }),
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
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Games'],
    }),
    cancelGame: builder.mutation<GenericResponse<GameDto>, number>({
      query: (gameId) => ({
        url: `/admin/social/games/${gameId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Games'],
    }),
    rescheduleGame: builder.mutation<GenericResponse<GameDto>, { gameId: number; request: CreateGameRequest }>({
      query: ({ gameId, request }) => ({
        url: `/admin/social/games/${gameId}/reschedule`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Games'],
    }),

    /* -- Groups -- */
    listGroups: builder.mutation<GenericResponse<SpringPage<CommunityGroupDto>>, ListSocialsParams>({
      query: ({ active, page = 0, size = 20 }) => {
        const params = new URLSearchParams()
        if (active !== undefined) params.append('active', String(active))
        params.append('page', String(page))
        params.append('size', String(size))
        return {
          url: `/admin/social/groups/list?${params.toString()}`,
          method: 'POST',
        }
      },
    }),
    getGroup: builder.mutation<GenericResponse<CommunityGroupDto>, number>({
      query: (groupId) => ({
        url: `/admin/social/groups/${groupId}/get`,
        method: 'POST',
      }),
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
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Groups'],
    }),
    toggleGroupActive: builder.mutation<GenericResponse<CommunityGroupDto>, { groupId: number; active: boolean }>({
      query: ({ groupId, active }) => ({
        url: `/admin/social/groups/${groupId}/active`,
        method: 'POST',
        body: { active },
      }),
      invalidatesTags: ['Groups'],
    }),
  }),
})

export const {
  useListTeamsMutation,
  useGetTeamMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useToggleTeamActiveMutation,
  useListGameFormatsMutation,
  useListGamesMutation,
  useGetGameMutation,
  useCreateGameMutation,
  useUpdateGameMutation,
  useCancelGameMutation,
  useRescheduleGameMutation,
  useListGroupsMutation,
  useGetGroupMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useToggleGroupActiveMutation,
} = socialsApi
