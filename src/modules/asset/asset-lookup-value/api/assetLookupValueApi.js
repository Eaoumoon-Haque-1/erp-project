/** @file Asset Lookup Value CRUD and batch endpoint contracts. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/lookup-values'

export const assetLookupValuesApi = {
  ...createCrudApi(resourcePath),

  list: ({ businessUnitId, typeId } = {}) => unwrapApiResponse(
    apiClient.get(resourcePath, {
      params: {
        ...(businessUnitId ? { buId: businessUnitId } : {}),
        ...(typeId ? { typeId } : {}),
      },
    }),
  ),

  getByType: (typeId) => unwrapApiResponse(
    apiClient.get(`/lookup-types/${typeId}/values`),
  ),

  saveByType: (typeId, payload) => unwrapApiResponse(
    apiClient.put(`/lookup-types/${typeId}/values`, payload),
  ),
}
