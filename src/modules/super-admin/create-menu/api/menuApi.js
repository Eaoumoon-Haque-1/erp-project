/** @file Menu endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const menusApi = {
  ...createCrudApi('/menus'),
  listByModule: (moduleId) =>
    unwrapApiResponse(apiClient.get(`/menus/module/${moduleId}`)),
}
