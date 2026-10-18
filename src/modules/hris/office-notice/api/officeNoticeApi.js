/** @file Office Notice CRUD endpoint contract with optional Business Unit filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const officeNoticesApi = {
  ...createCrudApi('/office-notices'),
  list: ({ businessUnitId, current } = {}) => unwrapApiResponse(
    apiClient.get('/office-notices', {
      params: {
        ...(businessUnitId ? { buId: businessUnitId } : {}),
        ...(current !== undefined ? { current } : {}),
      },
    }),
  ),
}
