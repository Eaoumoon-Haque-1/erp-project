/** @file User-to-Employee and User-to-Business-Unit assignment contracts. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

export const userAssignmentsApi = {
  getEmployee: (userId) =>
    unwrapApiResponse(apiClient.get(`/users/${userId}/employee`)),
  saveEmployee: (userId, payload) =>
    unwrapApiResponse(apiClient.put(`/users/${userId}/employee`, payload)),
  getBusinessUnits: (userId) =>
    unwrapApiResponse(apiClient.get(`/users/${userId}/business-units`)),
  saveBusinessUnits: (userId, payload) =>
    unwrapApiResponse(apiClient.put(`/users/${userId}/business-units`, payload)),
}

