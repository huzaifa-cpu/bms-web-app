/**
 * Dispute types matching backend DTOs
 */

export type DisputeStatusDto = 'OPEN' | 'RESOLVED' | 'CLOSED'

export type DisputeTypeDto = 'BOOKING' | 'PAYMENT' | 'SERVICE_QUALITY' | 'CANCELLATION' | 'REFUND' | 'OTHER'

export type DisputeResolution = 'REFUND_FULL' | 'REFUND_PARTIAL' | 'NO_REFUND' | 'CREDIT' | 'OTHER'

/** Matches backend DisputeDto */
export interface DisputeDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  type: DisputeTypeDto
  status: DisputeStatusDto
  bookingId: number | null
  paymentIntentId: number | null
  raisedByUserId: number
  raisedByName: string | null
  raisedByPhone: string | null
  againstUserId: number
  facilityId: number | null
  facilityName: string | null
  locationId: number | null
  locationName: string | null
  subject: string
  description: string
  openedAt: string
  closedAt: string | null
  resolution: DisputeResolution | null
  resolutionNotes: string | null
  assignedToUserId: number | null
}

/** Matches backend DisputeMessageDto */
export interface DisputeMessageDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  disputeId: number
  authorUserId: number
  authorParty: string
  message: string
  sentAt: string
}

/** Matches backend DisputeEvidenceDto */
export interface DisputeEvidenceDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  disputeId: number
  uploadedByUserId: number
  documentId: number
  note: string | null
  uploadedAt: string
}

/** Matches backend DisputeDetailsDto */
export interface DisputeDetailsDto {
  dispute: DisputeDto
  messages: DisputeMessageDto[]
  evidence: DisputeEvidenceDto[]
}

/** Matches backend AssignDisputeHttpRequest */
export interface AssignDisputeRequest {
  adminUserId: number
  assignedToUserId: number
}

/** Matches backend AdminUpdateStatusHttpRequest */
export interface UpdateDisputeStatusRequest {
  adminUserId: number
  status: DisputeStatusDto
  notes?: string
}

/** Matches backend AdminResolveDisputeHttpRequest */
export interface ResolveDisputeRequest {
  adminUserId: number
  resolution: DisputeResolution
  resolutionNotes?: string
  finalStatus?: DisputeStatusDto
}

/** Query params for listing disputes */
export interface ListDisputesParams {
  status?: string
  type?: string
  assignedTo?: number
}

/** Request to create a new dispute */
export interface CreateDisputeRequest {
  raisedByUserId: number
  facilityId?: number
  locationId?: number
  type: DisputeTypeDto
  bookingId?: number
  paymentIntentId?: number
  subject: string
  description: string
}

/** Request to close a dispute */
export interface CloseDisputeRequest {
  adminUserId: number
  status: 'CLOSED'
  notes?: string
}

