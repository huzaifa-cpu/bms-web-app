import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  ProviderOnboardingRequestDto,
  ProviderOnboardingReviewLogDto,
  AdminReviewOnboardingRequest,
  AdminProviderDto,
  AdminUpdateProviderRequest,
  ListProvidersParams,
  SpringPage,
} from './providers_types'

export const providersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Onboarding / Approval endpoints ── */
    listPendingProviders: builder.query<GenericResponse<ProviderOnboardingRequestDto[]>, void>({
      query: () => '/admin/provider/onboarding/pending',
      providesTags: ['Providers'],
    }),
    getProviderOnboarding: builder.query<GenericResponse<ProviderOnboardingRequestDto>, number>({
      query: (id) => `/admin/provider/onboarding/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Providers', id }],
    }),
    reviewProviderOnboarding: builder.mutation<GenericResponse<ProviderOnboardingRequestDto>, AdminReviewOnboardingRequest>({
      query: (request) => ({
        url: '/admin/provider/onboarding/review',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Providers'],
    }),
    getProviderReviewLogs: builder.query<GenericResponse<ProviderOnboardingReviewLogDto[]>, number>({
      query: (id) => `/admin/provider/onboarding/${id}/review-logs`,
      providesTags: (_result, _error, id) => [{ type: 'Providers', id }],
    }),

    /* ── Provider Management CRUD endpoints ── */
    listProviders: builder.query<GenericResponse<SpringPage<AdminProviderDto>>, ListProvidersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.approvalStates) {
          params.approvalStates.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/providers?${searchParams.toString()}`
      },
      providesTags: ['Providers'],
    }),
    getProvider: builder.query<GenericResponse<AdminProviderDto>, number>({
      query: (id) => `/admin/providers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Providers', id }],
    }),
    updateProvider: builder.mutation<GenericResponse<AdminProviderDto>, { providerId: number; request: AdminUpdateProviderRequest; cnicFront?: File; cnicBack?: File }>({
      query: ({ providerId, request, cnicFront, cnicBack }) => {
        const body = new FormData()
        body.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }))
        if (cnicFront) {
          body.append('cnicFront', cnicFront)
        }
        if (cnicBack) {
          body.append('cnicBack', cnicBack)
        }
        return {
          url: `/admin/providers/${providerId}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: ['Providers'],
    }),
    toggleProviderStatus: builder.mutation<GenericResponse<null>, { providerId: number; status: string }>({
      query: ({ providerId, status }) => ({
        url: `/admin/providers/${providerId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Providers'],
    }),
    approveProvider: builder.mutation<GenericResponse<AdminProviderDto>, { providerId: number; notes?: string }>({
      query: ({ providerId, notes }) => ({
        url: `/admin/providers/${providerId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Providers'],
    }),
    rejectProvider: builder.mutation<GenericResponse<AdminProviderDto>, { providerId: number; notes?: string }>({
      query: ({ providerId, notes }) => ({
        url: `/admin/providers/${providerId}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Providers'],
    }),
  }),
})

export const {
  useListPendingProvidersQuery,
  useGetProviderOnboardingQuery,
  useReviewProviderOnboardingMutation,
  useGetProviderReviewLogsQuery,
  useListProvidersQuery,
  useGetProviderQuery,
  useUpdateProviderMutation,
  useToggleProviderStatusMutation,
  useApproveProviderMutation,
  useRejectProviderMutation,
} = providersApi
