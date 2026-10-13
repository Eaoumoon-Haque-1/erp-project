/** @file Bulk User Type to Business Unit assignment endpoint contract. */
import apiClient from '../../../../api/client'
import { unwrapApiResponse } from '../../../../api/createCrudApi'

export const userTypeGroupsApi = {
  getByUserType: (userTypeId) =>
    unwrapApiResponse(apiClient.get(`/user-types/${userTypeId}/business-units`)),
  save: (userTypeId, payload) =>
    unwrapApiResponse(apiClient.put(`/user-types/${userTypeId}/business-units`, payload)),
}
