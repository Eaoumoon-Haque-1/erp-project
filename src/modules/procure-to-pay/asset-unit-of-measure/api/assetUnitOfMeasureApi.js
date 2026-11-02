/** @file Unit of Measure endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-uoms'

export const assetUnitsOfMeasureApi = {
  ...createCrudApi(resourcePath),
  list: (buId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: buId ? { buId } : undefined,
  })),
}
