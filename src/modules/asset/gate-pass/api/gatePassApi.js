/** @file Gate Pass endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/gate-passes'

export const gatePassApi = {
  ...createCrudApi(resourcePath),
  list: (buId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: buId ? { buId } : undefined,
  })),
}

