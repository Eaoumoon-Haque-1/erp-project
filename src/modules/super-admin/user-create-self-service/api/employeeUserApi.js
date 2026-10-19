/** @file Employee User GET/POST contract used by User Create Self Service. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

export const employeeUsersApi = {
  get: (employeeId) => unwrapApiResponse(apiClient.get(`/employees/${employeeId}/user`)),
  create: (employeeId, payload) => unwrapApiResponse(apiClient.post(`/employees/${employeeId}/user`, payload)),
}
