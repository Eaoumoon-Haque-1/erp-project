/**
 * @file API client for Customer Information (AFM_CUSTOMER_INFO).
 * Maps to backend AfmCustomerInfoController at /api/v1/afm-customers.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-customers'
const crud = createCrudApi(RESOURCE_PATH)

export const customerApi = {
  ...crud,

  /**
   * Retrieves customers with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, query, customerType, status)
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
   * Retrieves next sequential customer code.
   * @param {number|string} buId Business Unit ID
   */
  getNextCode: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/next-code`, {
        params: { buId },
      }),
    ),

  /**
   * Updates customer finance status (Draft <-> Approved).
   * @param {number|string} id Customer ID
   * @param {string} [status] Optional target status ('Draft' or 'Approved')
   */
  updateFinanceStatus: (id, status) =>
    unwrapApiResponse(
      apiClient.patch(`${RESOURCE_PATH}/${id}/finance-status`, null, {
        params: status ? { status } : undefined,
      }),
    ),
}

export default customerApi

