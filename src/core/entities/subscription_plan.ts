export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
  maxLocations: number
  maxFacilitiesPerLocation: number
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}
