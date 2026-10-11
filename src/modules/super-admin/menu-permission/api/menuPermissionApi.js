/** @file Menu Permission endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const permissionsApi = {
  ...createCrudApi('/permissions'),
  listByModule: (moduleId) =>
    unwrapApiResponse(apiClient.get(`/permissions/module/${moduleId}`)),
}
