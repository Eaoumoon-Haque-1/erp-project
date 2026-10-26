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

function responseData(response) {
  return response.data?.data ?? response.data
}

export async function loadAuthIdentity(session) {
  const assignmentRequest = session?.userId && !session.employeeName
    ? apiClient.get(`/users/${session.userId}/employee`).then(responseData)
    : Promise.resolve(null)
  const userRequest = session?.userId && !session.businessUnitName
    ? apiClient.get(`/users/${session.userId}`).then(responseData)
    : Promise.resolve(null)
  const [assignmentResult, userResult] = await Promise.allSettled([
    assignmentRequest,
    userRequest,
  ])
  const assignment = assignmentResult.status === 'fulfilled' ? assignmentResult.value : null
  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const employeeId = session?.userEmpId ?? assignment?.employeeId ?? null
  const businessUnitId = session?.buId ?? user?.buId ?? null

  const employeeRequest = employeeId && !session?.employeeName && !assignment?.employeeName
    ? apiClient.get(`/employees/${employeeId}`).then(responseData)
    : Promise.resolve(null)
  const businessUnitRequest = businessUnitId && !session?.businessUnitName
    ? apiClient.get(`/business-units/${businessUnitId}`).then(responseData)
    : Promise.resolve(null)
  const [employeeResult, businessUnitResult] = await Promise.allSettled([
    employeeRequest,
    businessUnitRequest,
  ])
  const employee = employeeResult.status === 'fulfilled' ? employeeResult.value : null
  const businessUnit = businessUnitResult.status === 'fulfilled' ? businessUnitResult.value : null

  return {
    userEmpId: employeeId,
    bgId: session?.bgId ?? user?.bgId ?? null,
    buId: businessUnitId,
    employeeName:
      session?.employeeName
      || assignment?.employeeName
      || employee?.employeeName
      || '',
    businessUnitName:
      session?.businessUnitName
      || businessUnit?.businessUnitName
      || businessUnit?.businessUnit
      || '',
  }
}
