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

// ---- Password recovery / change (see CLAUDE.md for the contract) ----
// Forgot/verify/reset are public; change-password needs the Bearer token,
// which the shared client attaches. Nothing here is logged or persisted.
export async function forgotPassword(payload) {
  const response = await apiClient.post('/auth/forgot-password', payload)
  return response.data
}

export async function verifyOtp(payload) {
  const response = await apiClient.post('/auth/verify-otp', payload)
  return response.data
}

export async function resetPassword(payload) {
  const response = await apiClient.post('/auth/reset-password', payload)
  return response.data
}

export async function changePassword(payload) {
  const response = await apiClient.post('/auth/change-password', payload)
  return response.data
}

// Backend message first; a missing response means the network failed.
export function getAuthErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (!error?.response) return 'Network error. Please try again.'
  return error.response.data?.message || fallbackMessage
}
