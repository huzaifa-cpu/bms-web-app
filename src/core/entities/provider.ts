import { ApprovalStatus } from '../enums/approval_status'

export interface Provider {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  cnicNumber: string
  cnicExpiry?: string
  cnicFrontUrl?: string
  cnicBackUrl?: string
  avatar?: string
  subscriptionPlanId?: string
  subscriptionPlanName?: string
  approvalStatus: ApprovalStatus
  rejectionReason?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
