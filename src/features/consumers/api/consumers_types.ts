/**
 * Consumer management types matching backend DTOs
 */

export type UserStatusDto = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL'

export type GenderDto = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

/** Matches backend AdminConsumerDto */
export interface AdminConsumerDto {
  id: number
  name: string
  email: string
  mobileNumber: string
  avatarUrl: string | null
  status: UserStatusDto
  displayName: string | null
  dateOfBirth: string | null
  gender: GenderDto | null
  city: string | null
  bio: string | null
  sports: string[]
  createdOn: string
  updatedOn: string
}

/** Matches backend AdminUpdateConsumerRequest */
export interface AdminUpdateConsumerRequest {
  name: string
  email: string
  mobileNumber: string
}

/** Query params for listing consumers */
export interface ListConsumersParams {
  status?: string
  search?: string
  page?: number
  size?: number
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
