/** @file Asset Item endpoint contract used by Asset Item Specification references. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-items'

export const assetItemsApi = {
  ...createCrudApi(resourcePath),
  list: (buId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: buId ? { buId } : undefined,
  })),
}
