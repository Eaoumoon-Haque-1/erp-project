/** @file Asset Lookup Type endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/lookup-types'

export const assetLookupTypesApi = {
  ...createCrudApi(resourcePath),
  list: (buId) => unwrapApiResponse(
    apiClient.get(resourcePath, { params: buId ? { buId } : undefined }),
  ),
}
