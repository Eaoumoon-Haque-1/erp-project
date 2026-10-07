/**
 * @file Authentication endpoint wrappers.
 * Login/logout are used now. Refresh remains available for when the backend
 * documents how the refresh token is delivered.
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
