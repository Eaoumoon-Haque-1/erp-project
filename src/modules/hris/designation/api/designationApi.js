/** @file Designation master endpoint contract with optional Business Group filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const designationsApi = {
  ...createCrudApi('/designations'),
  list: (businessGroupId) => unwrapApiResponse(apiClient.get('/designations', {
    params: businessGroupId ? { bgId: businessGroupId } : undefined,
  })),
  listByGroup: (businessGroupId) => unwrapApiResponse(apiClient.get('/designations', {
    params: { bgId: businessGroupId },
  })),
}
