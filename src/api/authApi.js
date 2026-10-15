/**
 * @file Authentication endpoint wrappers.
 * Login/logout are called by AuthProvider. The refresh wrapper mirrors the
 * endpoint used centrally by the shared Axios client's 401 retry flow.
 */
import apiClient from './client'

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function logout() {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

export async function refreshAccessToken(refreshToken) {
  const response = await apiClient.post('/auth/refresh', { refreshToken })
  return response.data
}
