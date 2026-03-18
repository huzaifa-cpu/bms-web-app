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
    /* -- Onboarding / Approval endpoints -- */
    listPendingProviders: builder.mutation<GenericResponse<ProviderOnboardingRequestDto[]>, void>({
      query: () => ({
        url: '/admin/provider/onboarding/pending',
        method: 'POST',
      }),
    }),
    getProviderOnboarding: builder.mutation<GenericResponse<ProviderOnboardingRequestDto>, number>({
      query: (id) => ({
        url: `/admin/provider/onboarding/${id}`,
        method: 'POST',
      }),
    }),
    reviewProviderOnboarding: builder.mutation<GenericResponse<ProviderOnboardingRequestDto>, AdminReviewOnboardingRequest>({
      query: (request) => ({
        url: '/admin/provider/onboarding/review',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Providers'],
    }),
    getProviderReviewLogs: builder.mutation<GenericResponse<ProviderOnboardingReviewLogDto[]>, number>({
      query: (id) => ({
        url: `/admin/provider/onboarding/${id}/review-logs`,
        method: 'POST',
      }),
    }),

    /* -- Provider Management CRUD endpoints -- */
    listProviders: builder.mutation<GenericResponse<SpringPage<AdminProviderDto>>, ListProvidersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.approvalStates) {
          params.approvalStates.forEach((state) => searchParams.append('approvalState', state))
        }
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/providers?${searchParams.toString()}`,
          method: 'POST',
        }
      },
    }),
    getProvider: builder.mutation<GenericResponse<AdminProviderDto>, number>({
      query: (id) => ({
        url: `/admin/providers/${id}/get`,
        method: 'POST',
      }),
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
          method: 'POST',
          body,
        }
      },
      invalidatesTags: ['Providers'],
    }),
    toggleProviderStatus: builder.mutation<GenericResponse<null>, { providerId: number; status: string }>({
      query: ({ providerId, status }) => ({
        url: `/admin/providers/${providerId}/status`,
        method: 'POST',
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
  useListPendingProvidersMutation,
  useGetProviderOnboardingMutation,
  useReviewProviderOnboardingMutation,
  useGetProviderReviewLogsMutation,
  useListProvidersMutation,
  useGetProviderMutation,
  useUpdateProviderMutation,
  useToggleProviderStatusMutation,
  useApproveProviderMutation,
  useRejectProviderMutation,
} = providersApi
