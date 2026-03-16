/**
 * Facility types matching backend DTOs
 */


export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED'

/** Matches backend FacilityScheduleDto */
export interface FacilityScheduleDto {
  id?: number
  dayOfWeek: string
  enabled: boolean
  startTime: string | null // HH:mm format
  endTime: string | null   // HH:mm format
  pricePerHour: number | null
}

/** Matches backend SportDto */
export interface SportDto {
  id: number
  name: string
  imageDocId: number | null
  imageUrl: string | null
}

/** Matches backend AdminFacilityDto */
export interface AdminFacilityDto {
  id: number
  venueId: number | null
  venueName: string | null
  providerUserId: number | null
  providerName: string | null
  sportId: number | null
  sportName: string | null
  name: string
  description: string | null
  capacity: number | null
  state: ApprovalState
  indoor: boolean
  floodLights: boolean
  active: boolean
  submittedAt: string | null
  imageUrls: string[]
  images: { url: string }[]
  schedules: FacilityScheduleDto[]
  createdOn: string
  updatedOn: string
}

/** Matches backend FacilityDto (legacy) */
export interface FacilityDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  venueId: number
  name: string
  sportId: number | null
  capacity: number | null
  description: string | null
  state: ApprovalState
  indoor: boolean
  floodLights: boolean
  submittedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  reviewedByUserId: number | null
  reviewNotes: string | null
  publishedAt: string | null
  active: boolean
}

/** Matches backend AdminDecisionRequest */
export interface AdminFacilityDecisionRequest {
  adminUserId?: number
  notes?: string
}

/* ── Facility Management types ── */

/** Query params for listing facilities */
export interface ListFacilitiesParams {
  approvalState?: ApprovalState[]
  search?: string
  page?: number
  size?: number
}

/** Admin create facility request */
export interface AdminCreateFacilityRequest {
  providerUserId: number
  venueId: number
  sportId: number
  name: string
  description?: string
  schedules: FacilityScheduleDto[]
}

/** Admin update facility request */
export interface AdminUpdateFacilityRequest {
  providerUserId: number
  venueId: number
  sportId: number
  name: string
  description?: string
  schedules: FacilityScheduleDto[]
  deleteImageIds?: number[]
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
