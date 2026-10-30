/**
 * @file API client for Payment Type and Payment Through Mapping.
 * Maps to backend AfmPTypePThroughMapController at /api/v1/afm-payment-type-through-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-payment-type-through-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const paymentTypeMappingApi = {
  ...crud,

  /**
   * Retrieves all mappings with optional filtering.
   * @param {object} [params={}] Query params (bgId, buId, status)
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
   * Retrieves mappings filtered by payment type.
   * @param {number|string} buId Business Unit ID
   * @param {number|string} paymentTypeId Payment Type Lookup Value ID
   * @param {number} [status] Optional status filter
   */
  getByPaymentType: (buId, paymentTypeId, status) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/by-payment-type`, {
        params: { buId, paymentTypeId, status },
      }),
    ),
}

export default paymentTypeMappingApi
