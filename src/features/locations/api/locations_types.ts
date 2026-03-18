/**
 * Location types matching backend DTOs
 */

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Matches backend AdminLocationDto */
export interface LocationDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  providerUserId: number
  providerName: string | null
  name: string
  description: string | null
  phone: string | null
  email: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  country: string | null
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  state: ApprovalState
  verified: boolean
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  reviewedByUserId: number | null
  reviewNotes: string | null
  publishedAt: string | null
  active: boolean
}

/** Matches backend AdminDecisionRequest */
export interface AdminDecisionRequest {
  adminUserId?: number
  notes?: string
}

/* ── Location Management types ── */

/** Query params for listing locations */
export interface ListLocationsParams {
  approvalState?: ApprovalState[]
  search?: string
  page?: number
  size?: number
}

/** Admin create location request */
export interface AdminCreateLocationRequest {
  providerUserId: number
  name: string
  addressLine1: string
  city: string
}

/** Admin update location request */
export interface AdminUpdateLocationRequest {
  providerUserId: number
  name: string
  addressLine1: string
  city: string
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
