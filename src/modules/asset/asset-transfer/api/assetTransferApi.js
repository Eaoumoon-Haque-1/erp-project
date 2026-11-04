/** @file Asset Transfer endpoint contracts for asset-transfer-controller. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-transfers'

export const assetTransferApi = {
  ...createCrudApi(resourcePath),
  list: (buId, itemId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: {
      ...(buId ? { buId } : {}),
      ...(itemId ? { itemId } : {}),
    },
  })),
  getCurrent: (itemId) => unwrapApiResponse(apiClient.get(`${resourcePath}/current`, {
    params: { itemId },
  })),
}

