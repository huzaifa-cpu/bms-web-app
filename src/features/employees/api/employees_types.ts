/**
 * Employee management types matching backend DTOs
 */

export type UserStatusDto = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_APPROVAL'

/** Matches backend AdminEmployeeDto */
export interface AdminEmployeeDto {
  id: number
  name: string
  email: string
  mobileNumber: string
  avatarUrl: string | null
  status: UserStatusDto
  providerId: number | null
  providerName: string | null
  locationId: number | null
  locationName: string | null
  facilityId: number | null
  facilityName: string | null
  jobTitle: string | null
  canOperateCash: boolean
  createdOn: string
  updatedOn: string
}

/** Matches backend AdminUpdateEmployeeRequest */
export interface AdminUpdateEmployeeRequest {
  name: string
  email: string
  mobileNumber: string
  jobTitle: string
  providerId: number
  locationId?: number | null
  facilityId?: number | null
}

/** Query params for listing employees */
export interface ListEmployeesParams {
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
