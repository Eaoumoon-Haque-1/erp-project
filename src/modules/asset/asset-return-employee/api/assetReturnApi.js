/** @file Asset Return endpoint contracts for asset-item-return-controller. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-returns'

export const assetReturnApi = {
  ...createCrudApi(resourcePath),
  list: (buId, emplId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: {
      ...(buId ? { buId } : {}),
      ...(emplId ? { emplId } : {}),
    },
  })),
  updateStatus: (id, currentRecord, status) => assetReturnApi.update(id, {
    ...currentRecord,
    status: Number(status),
  }),
}

