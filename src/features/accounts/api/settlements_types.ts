import type { SettlementStatus } from '../../../core/enums/settlement_status'
import type { SettlementType } from '../../../core/enums/settlement_type'

/** Matches backend SettlementDto */
export interface SettlementDto {
  id: number
  providerUserId: number
  providerName: string
  providerEmail: string
  planConfigId: number | null
  planName: string | null
  settlementType: SettlementType
  totalAmount: number
  currency: string
  status: SettlementStatus
  periodStart: string
  periodEnd: string
  approvedAt: string | null
  approvedBy: string | null
  paidAt: string | null
  failureReason: string | null
  notes: string | null
  createdOn: string
  updatedOn: string
  deleted: boolean
  items: SettlementItemDto[] | null
}

/** Matches backend SettlementItemDto */
export interface SettlementItemDto {
  id: number
  settlementId: number
  bookingId: number
  bookingRef: string
  bookingAmount: number
  commissionAmount: number
  commissionPercentage: number
  description: string | null
  createdOn: string
  deleted: boolean
}

/** Matches backend SettlementSummaryDto */
export interface SettlementSummaryDto {
  totalSettlements: number
  pendingCount: number
  approvedCount: number
  paidCount: number
  failedCount: number
  totalPendingAmount: number
  totalPaidAmount: number
}

/** Query params for listing settlements */
export interface ListSettlementsParams {
  status?: string
  type?: string
  providerUserId?: number
  page?: number
  size?: number
}

/** Request body for marking a settlement as failed */
export interface MarkSettlementFailedRequest {
  reason: string
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
