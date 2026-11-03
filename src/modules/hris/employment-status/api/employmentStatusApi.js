/** @file Employment Status CRUD endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const employmentStatusesApi = {
  ...createCrudApi('/employment-statuses'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/employment-statuses', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
