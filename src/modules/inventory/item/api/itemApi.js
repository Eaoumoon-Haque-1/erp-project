/**
 * @file API client for Item Master (INV_ITEM and INV_ITEM_ATTRIBUTE_DTLS).
 * Maps to backend InvItemController at /api/v1/inv-items.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-items'
const crud = createCrudApi(RESOURCE_PATH)

export const itemApi = {
  ...crud,

  /**
   * Retrieves all items with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, categoryId, brandId, uomId, storeId, itemName, itemCode, status)
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
   * Generates the next sequential item code (e.g. ITEM-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),

  /**
   * Retrieves attribute details for an item.
   * @param {number|string} itemId Item ID
   */
  getDetails: (itemId) =>
    unwrapApiResponse(apiClient.get(`${RESOURCE_PATH}/${itemId}/details`)),

  /**
   * Adds an attribute detail to an item.
   * @param {number|string} itemId Item ID
   * @param {object} detail Attribute detail payload
   */
  addDetail: (itemId, detail) =>
    unwrapApiResponse(apiClient.post(`${RESOURCE_PATH}/${itemId}/details`, detail)),

  /**
   * Updates an attribute detail of an item.
   * @param {number|string} itemId Item ID
   * @param {number|string} detailId Detail ID
   * @param {object} detail Attribute detail payload
   */
  updateDetail: (itemId, detailId, detail) =>
    unwrapApiResponse(
      apiClient.put(`${RESOURCE_PATH}/${itemId}/details/${detailId}`, detail),
    ),

  /**
   * Deletes an attribute detail of an item.
   * @param {number|string} itemId Item ID
   * @param {number|string} detailId Detail ID
   */
  deleteDetail: (itemId, detailId) =>
    unwrapApiResponse(
      apiClient.delete(`${RESOURCE_PATH}/${itemId}/details/${detailId}`),
    ),
}

export default itemApi

