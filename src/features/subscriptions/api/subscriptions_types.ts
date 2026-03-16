/**
 * Subscription types matching backend DTOs
 */

export type SubscriptionPlanDto = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'

export type SubscriptionStatusDto = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED' | 'PENDING'

export type PlanType = 'PERIOD_BASED' | 'COMMISSION_BASED'

export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

/** Matches backend SubscriptionDto */
export interface SubscriptionDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  providerUserId: number
  plan: SubscriptionPlanDto
  status: SubscriptionStatusDto
  startedAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  externalSubscriptionRef: string | null
  notes: string | null
}

/** Matches backend AdminAssignSubscriptionHttpRequest */
export interface AdminAssignSubscriptionRequest {
  adminUserId: number
  providerUserId: number
  plan: SubscriptionPlanDto
  status: SubscriptionStatusDto
  currentPeriodStart?: string
  currentPeriodEnd: string
  notes?: string
}

/** Query params for listing subscriptions */
export interface ListSubscriptionsParams {
  status?: string
  plan?: string
}

/** Matches backend PlanConfigDto */
export interface PlanConfigDto {
  id: number
  name: string
  description: string | null
  planType: PlanType
  // Period-based fields
  billingPeriod: BillingPeriod | null
  periodPrice: number | null
  // Commission-based fields
  commissionPercentage: number | null
  minCommissionAmount: number | null
  maxCommissionAmount: number | null
  // Common fields
  maxLocations: number
  maxFacilitiesPerLocation: number
  features: string[]
  active: boolean
  createdOn: string
  updatedOn: string
}

/** Matches backend CreatePlanConfigRequest */
export interface CreatePlanConfigRequest {
  name: string
  description?: string
  planType: PlanType
  // Period-based fields
  billingPeriod?: BillingPeriod
  periodPrice?: number
  // Commission-based fields
  commissionPercentage?: number
  minCommissionAmount?: number
  maxCommissionAmount?: number
  // Common fields
  maxLocations: number
  maxFacilitiesPerLocation: number
  features?: string[]
}

/** Matches backend UpdatePlanConfigRequest */
export interface UpdatePlanConfigRequest {
  name?: string
  description?: string
  planType?: PlanType
  // Period-based fields
  billingPeriod?: BillingPeriod
  periodPrice?: number
  // Commission-based fields
  commissionPercentage?: number
  minCommissionAmount?: number
  maxCommissionAmount?: number
  // Common fields
  maxLocations?: number
  maxFacilitiesPerLocation?: number
  features?: string[]
}

/** Enum option from backend */
export interface EnumOptionDto {
  value: string
  displayName: string
}

/** Plan metadata from backend */
export interface PlanMetadataDto {
  planTypes: EnumOptionDto[]
  billingPeriods: EnumOptionDto[]
}

/* ── Subscription Requests ── */

export type SubscriptionRequestStatusDto = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Matches backend SubscriptionRequestDto */
export interface SubscriptionRequestDto {
  id: number
  providerUserId: number
  providerName: string | null
  providerEmail: string | null
  providerPhone: string | null
  currentPlanConfigId: number | null
  currentPlanName: string | null
  requestedPlanConfigId: number
  requestedPlanName: string | null
  status: SubscriptionRequestStatusDto
  adminNotes: string | null
  reviewedAt: string | null
  reviewedByUserId: number | null
  reviewedByName: string | null
  reviewNotes: string | null
  createdOn: string
  updatedOn: string
}

/** Matches backend CreateSubscriptionRequestRequest */
export interface CreateSubscriptionRequestRequest {
  providerUserId: number
  planConfigId: number
  adminNotes?: string
}

/** Matches backend ReviewSubscriptionRequestRequest */
export interface ReviewSubscriptionRequestRequest {
  adminUserId: number
  decision: 'APPROVE' | 'REJECT'
  notes?: string
}

export interface ListSubscriptionRequestsParams {
  status?: string
  page?: number
  size?: number
}

export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
