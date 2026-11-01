/** @file Depreciation Category endpoint contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const resourcePath = '/depri-categories'

export const depreciationCategoriesApi = {
  ...createCrudApi(resourcePath),
  list: (buId) => unwrapApiResponse(apiClient.get(resourcePath, {
    params: buId ? { buId } : undefined,
  })),
}
