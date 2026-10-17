/** @file Wi-Fi Information CRUD endpoint contract with optional Business Unit filtering. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const wifiInformationsApi = {
  ...createCrudApi('/wifi-informations'),
  list: (businessUnitId) => unwrapApiResponse(apiClient.get('/wifi-informations', {
    params: businessUnitId ? { buId: businessUnitId } : undefined,
  })),
}
