/** @file API client for Asset Repair backend endpoints (/asset-repairs). */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-repairs'

export const assetRepairApi = {
  ...createCrudApi(resourcePath),

  list(buId, itemId, openOnly = false) {
    const params = {
      ...(buId ? { buId } : {}),
      ...(itemId ? { itemId } : {}),
      ...(openOnly ? { openOnly: true } : {}),
    }
    return unwrapApiResponse(apiClient.get(resourcePath, { params }))
  },

  updateStatus(id, currentRecord, status) {
    return assetRepairApi.update(id, {
      ...currentRecord,
      status: Number(status),
    })
  },
}

