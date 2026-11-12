/**
 * @file API client for Supplier Information (AFM_SUPPLIER_INFO).
 * Maps to backend AfmSupplierInfoController at /api/v1/afm-suppliers.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-suppliers'
const crud = createCrudApi(RESOURCE_PATH)

export const supplierApi = {
  ...crud,

  /**
   * Retrieves suppliers with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, query, supplierType, status)
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
   * Retrieves next sequential supplier code.
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),
}

export default supplierApi

