import { DisputeStatus } from '../enums/dispute_status'

export interface Dispute {
  id: string
  bookingId: string
  consumerId: string
  consumerName?: string
  providerId: string
  providerName?: string
  reason: string
  description: string
  status: DisputeStatus
  resolutionNotes?: string
  refundApplicable: boolean
  refundAmount?: number
  adminResponse?: string
  createdAt: string
  updatedAt: string
}
