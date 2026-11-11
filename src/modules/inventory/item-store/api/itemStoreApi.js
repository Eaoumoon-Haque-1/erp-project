/**
 * @file API client for Item Store (INV_ITEM_STORE).
 * Maps to backend InvItemStoreController at /api/v1/inv-item-stores.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-stores'
const crud = createCrudApi(RESOURCE_PATH)

export const itemStoreApi = {
  ...crud,

  /**
   * Retrieves all item stores with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, storeName, storeCode, isDefault, status)
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
   * Generates the next sequential store code (e.g. STR-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default itemStoreApi

