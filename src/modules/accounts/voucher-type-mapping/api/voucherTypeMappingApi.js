/**
 * @file API client for Voucher and Payment Type Mapping.
 * Maps to backend AfmVTypePTypeMapController at /api/v1/afm-voucher-type-payment-type-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-voucher-type-payment-type-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const voucherTypeMappingApi = {
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
   * Retrieves mappings filtered by voucher type.
   * @param {number|string} buId Business Unit ID
   * @param {number|string} voucherTypeId Voucher Type Lookup Value ID
   * @param {number} [status] Optional status filter
   */
  getByVoucherType: (buId, voucherTypeId, status) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/by-voucher-type`, {
        params: { buId, voucherTypeId, status },
      }),
    ),
}

export default voucherTypeMappingApi
