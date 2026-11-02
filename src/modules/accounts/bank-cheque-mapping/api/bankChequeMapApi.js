/**
 * @file API client for Bank Cheque Mapping.
 * Maps to backend AfmBankChequeMapController at /api/v1/afm-bank-cheque-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-bank-cheque-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const bankChequeMapApi = {
  ...crud,

  /**
   * Retrieves all bank cheque mappings with optional filtering.
   * @param {object} [params={}] Query params (bgId, buId, bankId, bankAccountId, chequeStatus, status)
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
   * Batch creates cheques in the given range.
   * @param {object} payload Request DTO
   */
  createBatch: (payload) =>
    unwrapApiResponse(apiClient.post(RESOURCE_PATH, payload)),
}

export default bankChequeMapApi

