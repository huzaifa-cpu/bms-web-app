/**
 * Booking types matching backend DTOs
 */

export type BookingStatusDto = 'HELD' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED'

export type BookingCancelReason = 'CONSUMER_REQUEST' | 'PROVIDER_REQUEST' | 'ADMIN_FORCE' | 'PAYMENT_FAILED' | 'NO_SHOW' | 'OTHER'

/** Matches backend BookingDto */
export interface BookingDto {
  id: number
  deleted: boolean
  createdOn: string
  updatedOn: string
  createdBy: string
  updatedBy: string
  consumerUserId: number
  providerUserId: number
  facilityId: number
  scheduleConfigId: number | null
  bookingRef: string | null
  status: BookingStatusDto
  bookingDate: string | null
  startTime: string | null
  endTime: string | null
  amount: number | null
  currency: string | null
  notes: string | null
  heldAt: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancelReason: BookingCancelReason | null
  cancelNotes: string | null
  completedAt: string | null
  externalPaymentRef: string | null
  paymentMode: string | null
  paymentStatus: string | null
}

/** Matches backend AdminForceCancelRequest */
export interface AdminForceCancelRequest {
  adminUserId: number
  notes?: string
}

/** Matches backend CreateWalkInBookingRequest */
export interface CreateWalkInBookingRequest {
  providerUserId: number
  facilityId: number
  bookingDate: string
  startTime: string
  endTime: string
  amount: number
  currency: string
  consumerUserId: number
  employeeUserId?: number
  cashPaidNow?: boolean
  notes?: string
}

/** Query params for listing bookings */
export interface ListBookingsParams {
  status?: string
  date?: string
}
