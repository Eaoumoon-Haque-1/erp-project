/** @file Department master endpoint contract with optional Business Group filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const departmentsApi = {
  ...createCrudApi('/departments'),
  list: (businessGroupId) => unwrapApiResponse(apiClient.get('/departments', {
    params: businessGroupId ? { bgId: businessGroupId } : undefined,
  })),
  listByGroup: (businessGroupId) => unwrapApiResponse(apiClient.get('/departments', {
    params: { bgId: businessGroupId },
  })),
}
