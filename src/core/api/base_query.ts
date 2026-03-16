import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { API_URL } from '../configs/env'
import StorageService from '../services/storage_service'
import AuthService from '../services/auth_service'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = StorageService.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

let isRefreshing = false

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Handle FormData requests manually to ensure proper Content-Type handling
  const fetchArgs = typeof args === 'string' ? { url: args } : args
  const isFormDataRequest = fetchArgs.body instanceof FormData

  if (isFormDataRequest) {
    const token = StorageService.getAccessToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type - browser will set it with correct multipart boundary

    try {
      const response = await fetch(`${API_URL}${fetchArgs.url}`, {
        method: fetchArgs.method || 'POST',
        headers,
        body: fetchArgs.body as FormData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data,
          } as FetchBaseQueryError,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: {
          status: 'FETCH_ERROR',
          error: String(error),
        } as FetchBaseQueryError,
      }
    }
  }

  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (isRefreshing) {
      // Already refreshing — give up and logout
      AuthService.logout()
      window.location.href = '/login'
      return result
    }

    isRefreshing = true
    try {
      await AuthService.refresh()
      isRefreshing = false
      // Retry with new token
      result = await rawBaseQuery(args, api, extraOptions)
    } catch {
      isRefreshing = false
      AuthService.logout()
      window.location.href = '/login'
    }
  }

  return result
}
