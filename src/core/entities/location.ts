import { ApprovalStatus } from '../enums/approval_status'

export interface Location {
  id: string
  providerId: string
  providerName?: string
  name: string
  address: string
  city: string
  country: string
  approvalStatus: ApprovalStatus
  rejectionReason?: string
  documentsUrls?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
