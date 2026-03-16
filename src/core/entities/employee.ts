export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  roleId?: string
  roleName?: string
  providerId: string
  providerName?: string
  locationId: string
  locationName?: string
  facilityIds: string[]
  facilityNames?: string[]
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

