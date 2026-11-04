/** @file Asset Maintenance endpoint contracts for asset-maintenance-controller. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-maintenances'

export const maintenanceAmcApi = {
  ...createCrudApi(resourcePath),
  list: (buId, itemId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: {
      ...(buId ? { buId } : {}),
      ...(itemId ? { itemId } : {}),
    },
  })),
  updateStatus: (id, currentRecord, status) => maintenanceAmcApi.update(id, {
    ...currentRecord,
    status: Number(status),
  }),
}

