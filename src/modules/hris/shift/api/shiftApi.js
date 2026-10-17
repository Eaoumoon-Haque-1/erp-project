/** @file Shift CRUD endpoint contract with optional Business Unit filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const shiftsApi = {
  ...createCrudApi('/shifts'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/shifts', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
