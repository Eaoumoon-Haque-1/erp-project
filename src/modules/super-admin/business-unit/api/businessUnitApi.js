/** @file Business Unit endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const businessUnitsApi = {
  ...createCrudApi('/business-units'),
  listByGroup: (businessGroupId) =>
    unwrapApiResponse(apiClient.get(`/business-units/group/${businessGroupId}`)),
}
