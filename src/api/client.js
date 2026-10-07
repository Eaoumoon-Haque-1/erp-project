/**
 * @file Shared Axios client for every backend module.
 * The request interceptor attaches the current Bearer token. The response
 * interceptor clears expired/invalid sessions and notifies AuthProvider.
 */
import axios from 'axios'
import { clearAuthSession, readAuthSession } from './authStorage'
import mockApiAdapter from './mockApiAdapter'

// Vite makes DEV false in production builds, so this flag cannot enable the
// in-browser simulator in a deployed build.
export const IS_MOCK_API_ENABLED = (
  import.meta.env.DEV
  && import.meta.env.VITE_USE_MOCK_API === 'true'
)

// Every environment must provide its API root explicitly. Keeping the address
// out of source avoids accidentally deploying an old development endpoint.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

if (!API_BASE_URL && !IS_MOCK_API_ENABLED) {
  throw new Error(
    'VITE_API_BASE_URL must contain the backend API root.',
  )
}

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://cloud-erp.mock/api/v1',
  ...(IS_MOCK_API_ENABLED ? { adapter: mockApiAdapter } : {}),
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
