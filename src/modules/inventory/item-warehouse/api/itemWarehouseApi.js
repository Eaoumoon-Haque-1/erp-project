/**
 * @file API client for Item Warehouse (INV_ITEM_WAREHOUSE).
 * Maps to backend InvItemWarehouseController at /api/v1/inv-item-warehouses.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-warehouses'
const crud = createCrudApi(RESOURCE_PATH)

export const itemWarehouseApi = {
  ...crud,

  /**
   * Retrieves all item warehouses with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, warehouseName, warehouseCode, storeId, isDefault, status)
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
   * Generates the next sequential warehouse code (e.g. WH-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default itemWarehouseApi

