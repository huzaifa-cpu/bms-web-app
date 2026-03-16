import { ApprovalStatus } from '../enums/approval_status'

export interface FacilityScheduleSlot {
  day: string
  openTime: string
  closeTime: string
  price: number
  isActive: boolean
}

export interface Facility {
  id: string
  locationId: string
  locationName?: string
  providerId: string
  providerName?: string
  name: string
  type: string
  capacity: number
  pricePerHour: number
  approvalStatus: ApprovalStatus
  rejectionReason?: string
  schedule?: FacilityScheduleSlot[]
  amenities?: string[]
  imagesUrls?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
