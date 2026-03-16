/**
 * Sport types matching backend DTOs
 */

/** Matches backend SportDto */
export interface SportDto {
  id: number
  name: string
  imageDocId: number | null
  imageUrl: string | null
  active: boolean
}

/** Create sport request - uses FormData in API */
export interface CreateSportRequest {
  name: string
  image: File
}

/** Update sport request - uses FormData in API */
export interface UpdateSportRequest {
  name: string
  image?: File
}

