/**
 * @file API client for Item Category (INV_ITEM_CATEGORY).
 * Maps to backend InvItemCategoryController at /api/v1/inv-item-categories.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-categories'
const crud = createCrudApi(RESOURCE_PATH)

export const itemCategoryApi = {
  ...crud,

  /**
   * Retrieves all item categories with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, categoryName, categoryCode, status)
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
   * Generates the next sequential category code (e.g. CAT-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default itemCategoryApi

