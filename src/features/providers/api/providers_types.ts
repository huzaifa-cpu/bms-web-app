/**
 * Provider onboarding types matching backend DTOs
 */

export type OnboardingStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export type ReviewDecision = 'APPROVE' | 'REJECT'

export type DocumentPurpose = 'CNIC_FRONT' | 'CNIC_BACK' | 'BUSINESS_LICENSE' | 'TAX_CERTIFICATE' | 'OTHER'

/** Matches backend ProviderOnboardingRequestDto */
export interface ProviderOnboardingRequestDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  providerUserId: number
  status: OnboardingStatus
  businessName: string
  ownerName: string
  email: string
  phone: string
  country: string
  city: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  cnicNumber: string
  submittedAt: string
  reviewedAt: string | null
  reviewedByUserId: number | null
  reviewNotes: string | null
}

/** Matches backend ProviderOnboardingReviewLogDto */
export interface ProviderOnboardingReviewLogDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  onboardingRequestId: number
  decision: ReviewDecision
  comment: string | null
  reviewerUserId: number | null
  decidedAt: string
}

/** Matches backend AdminReviewOnboardingRequest */
export interface AdminReviewOnboardingRequest {
  onboardingRequestId: number
  decision: string
  comment?: string
}

/* ── Provider Management types ── */

export type UserStatusDto = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL'

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Matches backend AdminProviderDto */
export interface AdminProviderDto {
  id: number
  name: string
  email: string
  mobileNumber: string
  avatarUrl: string | null
  status: UserStatusDto
  businessName: string | null
  supportPhone: string | null
  supportEmail: string | null
  approvalState: ApprovalState | null
  cnicNumber: string | null
  cnicExpiry: string | null
  cnicFrontDocId: number | null
  cnicBackDocId: number | null
  cnicFrontUrl: string | null
  cnicBackUrl: string | null
  planConfigId: number | null
  planName: string | null
  createdOn: string
  updatedOn: string
}

/** Matches backend AdminUpdateProviderRequest */
export interface AdminUpdateProviderRequest {
  name: string
  email: string
  mobileNumber: string
  businessName?: string
  supportPhone?: string
  supportEmail?: string
  cnicNumber?: string
  cnicExpiry?: string
  deleteCnicFront?: boolean
  deleteCnicBack?: boolean
  planConfigId?: number
}

/** Query params for listing providers */
export interface ListProvidersParams {
  status?: string
  approvalStates?: string[]
  search?: string
  page?: number
  size?: number
}

/** Spring Data Page response format */
export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
}
