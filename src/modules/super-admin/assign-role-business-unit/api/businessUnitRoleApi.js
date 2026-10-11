/** @file Business Unit to Role assignment endpoint contract. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

export const businessUnitRolesApi = {
  list: (businessUnitId) =>
    unwrapApiResponse(apiClient.get(`/business-units/${businessUnitId}/roles`)),
  assign: (businessUnitId, roleId) =>
    unwrapApiResponse(apiClient.post(`/business-units/${businessUnitId}/roles`, { roleId })),
  remove: (businessUnitId, mappingId) =>
    unwrapApiResponse(apiClient.delete(`/business-units/${businessUnitId}/roles/${mappingId}`)),
}
