/** @file Mobile Notification bulk-create and record CRUD endpoint contract. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

const basePath = '/mobile-notifications'

export const mobileNotificationsApi = {
  list: ({ businessUnitId, employeeId } = {}) => unwrapApiResponse(
    apiClient.get(basePath, { params: {
      ...(businessUnitId ? { buId: businessUnitId } : {}),
      ...(employeeId ? { emplId: employeeId } : {}),
    } }),
  ),
  get: (id) => unwrapApiResponse(apiClient.get(`${basePath}/${id}`)),
  create: (payload) => unwrapApiResponse(apiClient.post(basePath, payload)),
  update: (id, payload) => unwrapApiResponse(apiClient.put(`${basePath}/${id}`, payload)),
  remove: (id) => unwrapApiResponse(apiClient.delete(`${basePath}/${id}`)),
}
