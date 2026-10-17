/** @file Leave Allocation CRUD endpoint contract with optional list filters. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const leaveAllocationsApi = {
  ...createCrudApi('/leave-allocations'),
  list: ({ businessUnitId, leaveYear } = {}) => unwrapApiResponse(
    apiClient.get('/leave-allocations', {
      params: {
        ...(businessUnitId ? { buId: businessUnitId } : {}),
        ...(leaveYear ? { leaveYear } : {}),
      },
    }),
  ),
}
