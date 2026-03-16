import { BookingStatus } from '../enums/booking_status'
import { PaymentStatus } from '../enums/payment_status'

export interface Booking {
  id: string
  facilityId: string
  facilityName?: string
  locationId: string
  locationName?: string
  providerId: string
  providerName?: string
  consumerId: string
  consumerName?: string
  consumerPhone?: string
  startTime: string
  endTime: string
  durationHours: number
  totalAmount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  cancellationReason?: string
  refundEligible?: boolean
  createdAt: string
  updatedAt: string
}
