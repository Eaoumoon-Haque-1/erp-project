/** @file API client for Asset Book Register endpoint. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-book-registers'

export const assetBookRegisterApi = {
  ...createCrudApi(resourcePath),
  list: (buId) =>
    unwrapApiResponse(
      apiClient.get(resourcePath, {
        params: buId ? { buId } : undefined,
      }),
    ),
  changeStatus: (id, status) =>
    unwrapApiResponse(
      apiClient.patch(`${resourcePath}/${id}/status`, null, {
        params: { status },
      }),
    ),
}
