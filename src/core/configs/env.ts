const viteUrl = import.meta.env.VITE_API_URL as string | undefined
const legacyUrl = import.meta.env.REACT_APP_API_URL as string | undefined

let apiUrl: string

if (viteUrl) {
  apiUrl = viteUrl
} else if (legacyUrl) {
  apiUrl = legacyUrl
} else if (import.meta.env.DEV) {
  throw new Error('API base URL is not configured. Set VITE_API_URL in .env')
} else {
  apiUrl = ''
}

export const API_URL = apiUrl
