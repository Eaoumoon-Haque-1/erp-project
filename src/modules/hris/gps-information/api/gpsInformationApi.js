/** @file GPS Information CRUD endpoint contract with optional Business Unit filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const gpsInformationsApi = {
  ...createCrudApi('/gps-informations'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/gps-informations', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
