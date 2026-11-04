/** @file Asset Assignment endpoint contracts for asset-assign-controller. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/asset-assignments'

export const assetAssignmentApi = {
  ...createCrudApi(resourcePath),
  list: (buId, emplId, openOnly) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: {
      ...(buId ? { buId } : {}),
      ...(emplId ? { emplId } : {}),
      ...(openOnly !== undefined ? { openOnly } : {}),
    },
  })),
  updateStatus: (id, currentRecord, status) => assetAssignmentApi.update(id, {
    ...currentRecord,
    status: Number(status),
  }),
}

