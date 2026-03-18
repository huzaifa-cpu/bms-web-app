/**
 * Notification types matching backend DTOs
 */

export type NotificationType = 'GENERAL' | 'BOOKING' | 'PAYMENT' | 'DISPUTE' | 'SUBSCRIPTION' | 'SYSTEM'

export type ReferenceType = 'NONE' | 'BOOKING' | 'PAYMENT' | 'DISPUTE' | 'LOCATION' | 'FACILITY'

export type NotificationStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'CANCELED'

export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH'

/** Matches backend BroadcastNotificationHttpRequest */
export interface BroadcastNotificationRequest {
  userIds: number[]
  title: string
  message: string
  type?: NotificationType
  referenceType?: ReferenceType
  referenceId?: number
}

/** Matches backend NotificationDto */
export interface NotificationDto {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
  status: NotificationStatus
  read: boolean
  readAt: string | null
  referenceType: ReferenceType
  referenceId: number | null
  scheduledAt: string | null
  sentAt: string | null
  failureReason: string | null
  createdOn: string
  updatedOn: string
}

export interface ListNotificationHistoryParams {
  status?: NotificationStatus
  channel?: NotificationChannel
  page?: number
  size?: number
}

export interface SpringPage<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}
