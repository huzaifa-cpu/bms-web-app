export interface TeamMemberDto {
  userId: number
  userName: string | null
  userPhone: string | null
  role: string
}

export interface TeamDto {
  id: number
  ownerUserId: number
  sportId: number | null
  sportName: string | null
  name: string
  imageDocId: number | null
  imageUrl?: string
  description?: string
  active: boolean
  members?: TeamMemberDto[]
  createdOn: string
  updatedOn: string
}

export interface GameFormatDto {
  value: string
  displayName: string
  minPlayers: number
  maxPlayers: number
}

export interface GameDto {
  id: number
  createdByUserId: number
  organizerName?: string
  organizerPhone?: string
  title: string
  description?: string
  visibility: string
  status: string
  sportId?: number
  sportName?: string
  gameFormat?: string
  maxPlayers?: number
  minPlayers?: number
  gameDate?: string
  startTime?: string
  endTime?: string
  venueId?: number
  venueName?: string
  facilityId?: number
  bookingId?: number
  city?: string
  rules?: string
  joinPolicy?: string
  createdOn: string
  updatedOn: string
}

export interface CreateGameRequest {
  title: string
  description?: string
  organizerUserId: number
  sportId: number
  gameFormat: string
  venueId: number
  gameDate: string
  startTime: string
  endTime?: string
  rules?: string
  visibility?: string
  joinPolicy?: string
}

export interface GroupMemberDto {
  id: number
  userId: number
  userName: string | null
  userPhone: string | null
  role: string
  status: string
  joinedAt: string
}

export interface CommunityGroupDto {
  id: number
  createdByUserId: number
  sportId: number | null
  sportName: string | null
  name: string
  description?: string
  imageDocId: number | null
  imageUrl?: string
  joinPolicy?: string
  active: boolean
  members?: GroupMemberDto[]
  createdOn: string
  updatedOn: string
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ListSocialsParams {
  active?: boolean
  page?: number
  size?: number
}

export interface ListGamesParams {
  status?: string
  page?: number
  size?: number
}

/** Team member for create request */
export interface TeamMemberRequest {
  userId: number
  isCaptain: boolean
}

/** Create team request (without image - sent as multipart) */
export interface CreateTeamRequest {
  name: string
  sportId: number
  description?: string
  members: TeamMemberRequest[]
}

/** Group member for create request */
export interface GroupMemberRequest {
  userId: number
  admin: boolean
}

/** Create group request (without image - sent as multipart) */
export interface CreateGroupRequest {
  name: string
  sportId: number
  description?: string
  members: GroupMemberRequest[]
}

