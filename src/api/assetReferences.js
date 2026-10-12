/** @file Read-only lookup endpoints used by Asset Receive dropdowns. */
import apiClient from './client'
import { unwrapApiResponse } from './createCrudApi'

const getList = (url, params) => unwrapApiResponse(apiClient.get(url, { params }))

export const assetItemsApi = { list: (buId) => getList('/asset-items', { buId }) }
export const assetUomsApi = { list: (buId) => getList('/asset-uoms', { buId }) }
export const depriCategoriesApi = { list: (buId) => getList('/depri-categories', { buId }) }
export const lookupTypesApi = { list: (buId) => getList('/lookup-types', { buId }) }
export const lookupValuesApi = {
  // typeId is optional; omit it to list every value of the Business Unit.
  list: (buId, typeId) => getList('/lookup-values', { buId, typeId }),
}
