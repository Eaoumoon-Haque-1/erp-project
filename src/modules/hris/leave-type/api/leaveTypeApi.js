/** @file Leave Type CRUD endpoint contract with optional Business Group filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const leaveTypesApi = {
  ...createCrudApi('/leave-types'),
  list: (businessGroupId) => unwrapApiResponse(apiClient.get('/leave-types', {
    params: businessGroupId ? { bgId: businessGroupId } : undefined,
  })),
  listByGroup: (businessGroupId) => unwrapApiResponse(apiClient.get('/leave-types', {
    params: { bgId: businessGroupId },
  })),
}
