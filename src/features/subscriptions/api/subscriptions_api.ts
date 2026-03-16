import { apiSlice } from '../../../core/api/api_slices'
import type { GenericResponse } from '../../../core/dtos/generic_response'
import type {
  SubscriptionDto,
  AdminAssignSubscriptionRequest,
  ListSubscriptionsParams,
  PlanConfigDto,
  PlanMetadataDto,
  CreatePlanConfigRequest,
  UpdatePlanConfigRequest,
  SubscriptionRequestDto,
  CreateSubscriptionRequestRequest,
  ReviewSubscriptionRequestRequest,
  ListSubscriptionRequestsParams,
  SpringPage,
} from './subscriptions_types'

export const subscriptionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listSubscriptions: builder.query<GenericResponse<SubscriptionDto[]>, ListSubscriptionsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.plan) searchParams.set('plan', params.plan)
        const qs = searchParams.toString()
        return `/admin/subscriptions${qs ? `?${qs}` : ''}`
      },
      providesTags: ['ProviderSubscriptions'],
    }),
    assignSubscription: builder.mutation<GenericResponse<SubscriptionDto>, AdminAssignSubscriptionRequest>({
      query: (request) => ({
        url: '/admin/subscriptions/assign',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['ProviderSubscriptions'],
    }),
    // Plan Metadata
    getPlanMetadata: builder.query<GenericResponse<PlanMetadataDto>, void>({
      query: () => '/admin/subscriptions/plans/metadata',
    }),
    // Plan Config CRUD
    listPlans: builder.query<GenericResponse<PlanConfigDto[]>, void>({
      query: () => '/admin/subscriptions/plans',
      providesTags: ['SubscriptionPlans'],
    }),
    getPlan: builder.query<GenericResponse<PlanConfigDto>, number>({
      query: (id) => `/admin/subscriptions/plans/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionPlans', id }],
    }),
    createPlan: builder.mutation<GenericResponse<PlanConfigDto>, CreatePlanConfigRequest>({
      query: (request) => ({
        url: '/admin/subscriptions/plans',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['SubscriptionPlans'],
    }),
    updatePlan: builder.mutation<GenericResponse<PlanConfigDto>, { planId: number; request: UpdatePlanConfigRequest }>({
      query: ({ planId, request }) => ({
        url: `/admin/subscriptions/plans/${planId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['SubscriptionPlans'],
    }),
    togglePlanActive: builder.mutation<GenericResponse<null>, { planId: number; active: boolean }>({
      query: ({ planId, active }) => ({
        url: `/admin/subscriptions/plans/${planId}/status`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: ['SubscriptionPlans'],
    }),
    // Subscription Requests
    listSubscriptionRequests: builder.query<GenericResponse<SpringPage<SubscriptionRequestDto>>, ListSubscriptionRequestsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return `/admin/subscriptions/requests?${searchParams.toString()}`
      },
      providesTags: ['SubscriptionRequests'],
    }),
    getSubscriptionRequest: builder.query<GenericResponse<SubscriptionRequestDto>, number>({
      query: (id) => `/admin/subscriptions/requests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionRequests', id }],
    }),
    createSubscriptionRequest: builder.mutation<GenericResponse<SubscriptionRequestDto>, CreateSubscriptionRequestRequest>({
      query: (request) => ({
        url: '/admin/subscriptions/requests',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['SubscriptionRequests'],
    }),
    reviewSubscriptionRequest: builder.mutation<GenericResponse<SubscriptionRequestDto>, { requestId: number; request: ReviewSubscriptionRequestRequest }>({
      query: ({ requestId, request }) => ({
        url: `/admin/subscriptions/requests/${requestId}/review`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['SubscriptionRequests'],
    }),
  }),
})

export const {
  useListSubscriptionsQuery,
  useAssignSubscriptionMutation,
  useGetPlanMetadataQuery,
  useListPlansQuery,
  useGetPlanQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanActiveMutation,
  useListSubscriptionRequestsQuery,
  useGetSubscriptionRequestQuery,
  useCreateSubscriptionRequestMutation,
  useReviewSubscriptionRequestMutation,
} = subscriptionsApi
