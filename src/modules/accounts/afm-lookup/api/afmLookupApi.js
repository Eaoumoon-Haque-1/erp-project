/**
 * @file API client methods for AFM Lookup Type and Lookup Values.
 * Maps to backend AfmLookupTypeController at /api/v1/afm-lookup-types.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-lookup-types'
const crud = createCrudApi(RESOURCE_PATH)

export const afmLookupApi = {
  ...crud,

  /**
   * Retrieves all lookup types with optional filters.
   * @param {object|string|number} params Search/filter params or buId
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
   * Retrieves a lookup type by business unit and unique type code.
   * @param {number|string} buId Business Unit ID
   * @param {string} typeCode Lookup Type Code
   */
  getByCode: (buId, typeCode) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/by-code`, {
        params: { buId, typeCode },
      }),
    ),

  /**
   * Retrieves all lookup values for a specific lookup type.
   * @param {number|string} typeId Lookup Type ID
   */
  getValues: (typeId) =>
    unwrapApiResponse(apiClient.get(`${RESOURCE_PATH}/${typeId}/values`)),

  /**
   * Retrieves lookup values by type code with optional buId and status filter.
   * Can be called as getValuesByCode(typeCode, buId, status) or getValuesByCode(buId, typeCode, status).
   * @param {string|number} firstParam Lookup Type Code or Business Unit ID
   * @param {string|number} [secondParam] Lookup Type Code (if first was buId) or Business Unit ID
   * @param {number} [status] Optional status filter (1 = Active, 0 = Inactive)
   */
  getValuesByCode: (firstParam, secondParam, status) => {
    let typeCode = firstParam
    let buId = secondParam
    // If firstParam is numeric and secondParam is string, swap them
    if (typeof firstParam === 'number' || (!isNaN(firstParam) && isNaN(secondParam))) {
      buId = firstParam
      typeCode = secondParam
    }
    return unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/values/by-code`, {
        params: { typeCode, buId: buId || undefined, status },
      }),
    )
  },

  /**
   * Retrieves lookup values by type code using the /values-by-type-code endpoint.
   * @param {string} typeCode Lookup Type Code (e.g. 'P001', 'PTH001')
   * @param {number|string} [buId] Optional Business Unit ID
   * @param {number} [status] Optional status filter (1 = Active, 0 = Inactive)
   */
  getValuesByTypeCode: (typeCode, buId, status) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/values-by-type-code`, {
        params: { typeCode, buId: buId || undefined, status },
      }),
    ),

  /**
   * Appends an individual lookup value detail row.
   * @param {number|string} typeId Lookup Type ID
   * @param {object} payload Lookup value payload
   */
  addValue: (typeId, payload) =>
    unwrapApiResponse(apiClient.post(`${RESOURCE_PATH}/${typeId}/values`, payload)),

  /**
   * Updates an individual lookup value detail row.
   * @param {number|string} typeId Lookup Type ID
   * @param {number|string} valueId Lookup Value ID
   * @param {object} payload Lookup value payload
   */
  updateValue: (typeId, valueId, payload) =>
    unwrapApiResponse(
      apiClient.put(`${RESOURCE_PATH}/${typeId}/values/${valueId}`, payload),
    ),

  /**
   * Deletes an individual lookup value detail row.
   * @param {number|string} typeId Lookup Type ID
   * @param {number|string} valueId Lookup Value ID
   */
  removeValue: (typeId, valueId) =>
    unwrapApiResponse(
      apiClient.delete(`${RESOURCE_PATH}/${typeId}/values/${valueId}`),
    ),
}

export default afmLookupApi
