/** @file Asset Item Specification endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-item-specs'

export const assetSpecificationMapsApi = {
  ...createCrudApi(resourcePath),
  list: ({ businessUnitId, itemNameId } = {}) => unwrapApiResponse(
    apiClient.get(resourcePath, {
      params: {
        ...(businessUnitId ? { buId: businessUnitId } : {}),
        ...(itemNameId ? { itemNameId } : {}),
      },
    }),
  ),
}
