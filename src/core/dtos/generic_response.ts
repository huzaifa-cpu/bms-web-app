export interface GenericResponse<T> {
  success: boolean
  data: T
  message?: string
}
