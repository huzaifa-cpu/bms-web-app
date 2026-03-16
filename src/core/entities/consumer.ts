export interface Consumer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // New fields
  playedGamesCount?: number
  friendsCount?: number
  gameLevel?: 'Beginner' | 'Intermediate' | 'Pro'
  sports?: string[]
  dob?: string
  gender?: 'Male' | 'Female' | 'Other'
  bio?: string
  location?: string
}
