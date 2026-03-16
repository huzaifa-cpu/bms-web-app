import type { AppError } from './app_error'

interface ApiErrorShape {
  status?: number
  data?: {
    message?: string
    code?: string
    errors?: unknown
  }
  error?: string
}

export function mapToAppError(error: unknown): AppError {
  if (error === null || error === undefined) {
    return { code: 'UNKNOWN', message: 'An unknown error occurred' }
  }

  const err = error as ApiErrorShape

  // RTK Query error with status
  if (err.status !== undefined) {
    const status = typeof err.status === 'number' ? err.status : undefined
    const data = err.data

    if (status === 401) {
      return { code: 'UNAUTHORIZED', message: 'Unauthorized. Please log in again.', status }
    }
    if (status === 403) {
      return { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.', status }
    }
    if (status === 404) {
      return { code: 'NOT_FOUND', message: data?.message ?? 'Resource not found.', status }
    }
    if (status === 422 || status === 400) {
      return {
        code: data?.code ?? 'VALIDATION_ERROR',
        message: data?.message ?? 'Validation failed.',
        details: data?.errors,
        status,
      }
    }
    if (status !== undefined && status >= 500) {
      return { code: 'SERVER_ERROR', message: data?.message ?? 'Server error. Please try again later.', status }
    }

    // Network / fetch error
    if (err.error) {
      return { code: 'NETWORK_ERROR', message: err.error }
    }

    return {
      code: data?.code ?? 'API_ERROR',
      message: data?.message ?? 'An error occurred.',
      status,
    }
  }

  // JS Error object
  if (error instanceof Error) {
    return { code: 'CLIENT_ERROR', message: error.message }
  }

  // Fallback
  return { code: 'UNKNOWN', message: String(error) }
}
