/**
 * @file API client for Item Attribute (INV_ITEM_ATTRIBUTE).
 * Maps to backend InvItemAttributeController at /api/v1/inv-item-attributes.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-attributes'
const crud = createCrudApi(RESOURCE_PATH)

export const itemAttributeApi = {
  ...crud,

  /**
   * Retrieves all item attributes with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, attributeName, attributeCode, status)
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
   * Generates the next sequential attribute code (e.g. ATTR-00001).
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default itemAttributeApi

