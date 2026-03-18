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
    listSubscriptions: builder.mutation<GenericResponse<SubscriptionDto[]>, ListSubscriptionsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.plan) searchParams.set('plan', params.plan)
        const qs = searchParams.toString()
        return {
          url: `/admin/subscriptions${qs ? `?${qs}` : ''}`,
          method: 'POST',
        }
      },
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
    getPlanMetadata: builder.mutation<GenericResponse<PlanMetadataDto>, void>({
      query: () => ({
        url: '/admin/subscriptions/plans/metadata',
        method: 'POST',
      }),
    }),
    // Plan Config CRUD
    listPlans: builder.mutation<GenericResponse<PlanConfigDto[]>, void>({
      query: () => ({
        url: '/admin/subscriptions/plans/list',
        method: 'POST',
      }),
    }),
    getPlan: builder.mutation<GenericResponse<PlanConfigDto>, number>({
      query: (id) => ({
        url: `/admin/subscriptions/plans/${id}/get`,
        method: 'POST',
      }),
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
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['SubscriptionPlans'],
    }),
    togglePlanActive: builder.mutation<GenericResponse<null>, { planId: number; active: boolean }>({
      query: ({ planId, active }) => ({
        url: `/admin/subscriptions/plans/${planId}/status`,
        method: 'POST',
        body: { active },
      }),
      invalidatesTags: ['SubscriptionPlans'],
    }),
    // Subscription Requests
    listSubscriptionRequests: builder.mutation<GenericResponse<SpringPage<SubscriptionRequestDto>>, ListSubscriptionRequestsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        searchParams.set('page', String(params?.page ?? 0))
        searchParams.set('size', String(params?.size ?? 20))
        return {
          url: `/admin/subscriptions/requests/list?${searchParams.toString()}`,
          method: 'POST',
        }
      },
    }),
    getSubscriptionRequest: builder.mutation<GenericResponse<SubscriptionRequestDto>, number>({
      query: (id) => ({
        url: `/admin/subscriptions/requests/${id}`,
        method: 'POST',
      }),
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
  useListSubscriptionsMutation,
  useAssignSubscriptionMutation,
  useGetPlanMetadataMutation,
  useListPlansMutation,
  useGetPlanMutation,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanActiveMutation,
  useListSubscriptionRequestsMutation,
  useGetSubscriptionRequestMutation,
  useCreateSubscriptionRequestMutation,
  useReviewSubscriptionRequestMutation,
} = subscriptionsApi
