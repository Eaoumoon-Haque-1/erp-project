/**
 * @file API client for Item Brand (INV_ITEM_BRAND).
 * Maps to backend InvItemBrandController at /api/v1/inv-item-brands.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-brands'
const crud = createCrudApi(RESOURCE_PATH)

export const itemBrandApi = {
  ...crud,

  /**
   * Retrieves all item brands with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, brandName, brandCode, status)
   */
  list: (params = {}) =>
    unwrapApiResponse(
      apiClient.get(RESOURCE_PATH, {
        params:
          typeof params === 'object' && params !== null
            ? params
            : params
            ? { buId: params }
            : undefined,
      }),
    ),

  /**
   * Generates the next sequential brand code (e.g. BRD-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default itemBrandApi

