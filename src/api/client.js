/**
 * @file Shared Axios client for every backend module.
 * The request interceptor attaches the current Bearer token. The response
 * interceptor clears expired/invalid sessions and notifies AuthProvider.
 */
import axios from 'axios'
import { clearAuthSession, readAuthSession } from './authStorage'

// Every environment must provide its API root explicitly. Keeping the address
// out of source avoids accidentally deploying an old development endpoint.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL must contain the backend API root.',
  )
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const session = readAuthSession()

  if (session?.accessToken) {
    config.headers.Authorization =
      `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()
      window.dispatchEvent(new Event('cloud-erp:session-expired'))
    }

    return Promise.reject(error)
  },
)

export default apiClient
