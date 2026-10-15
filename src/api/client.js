/**
 * @file Shared Axios client for every backend module.
 * The request interceptor attaches the current Bearer token. The response
 * interceptor renews expired access tokens, retries the original request, and
 * clears the session only when renewal is unavailable or fails.
 */
import axios from 'axios'
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from './authStorage'

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

// Refresh uses a client without the application interceptors so a failed
// refresh cannot recursively attempt to refresh itself.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

let refreshRequest = null

function notifySessionExpired() {
  clearAuthSession()
  window.dispatchEvent(new Event('cloud-erp:session-expired'))
}

async function renewSession(session) {
  if (!session?.refreshToken) throw new Error('Refresh token is not available.')

  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post('/auth/refresh', { refreshToken: session.refreshToken })
      .then(({ data }) => {
        const nextSession = saveAuthSession(data, session)
        window.dispatchEvent(new CustomEvent('cloud-erp:session-refreshed', {
          detail: nextSession,
        }))
        return nextSession
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

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
  async (error) => {
    const originalRequest = error.config
    const isAuthenticationRequest = ['/auth/login', '/auth/refresh'].some(
      (path) => originalRequest?.url?.endsWith(path),
    )

    if (
      error.response?.status !== 401
      || !originalRequest
      || originalRequest._retry
      || isAuthenticationRequest
    ) {
      if (error.response?.status === 401 && !isAuthenticationRequest) {
        notifySessionExpired()
      }
      return Promise.reject(error)
    }

    const session = readAuthSession()
    if (!session?.refreshToken) {
      notifySessionExpired()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const nextSession = await renewSession(session)
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization =
        `${nextSession.tokenType || 'Bearer'} ${nextSession.accessToken}`
      return apiClient(originalRequest)
    } catch {
      notifySessionExpired()
    }

    return Promise.reject(error)
  },
)

export default apiClient
