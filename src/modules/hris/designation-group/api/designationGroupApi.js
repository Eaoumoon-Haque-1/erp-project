/** @file Designation-to-Business-Unit assignment endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const designationGroupsApi = {
  ...createCrudApi('/designation-groups'),
  list: (designationId) => unwrapApiResponse(apiClient.get('/designation-groups', {
    params: designationId ? { desigId: designationId } : undefined,
  })),
}
