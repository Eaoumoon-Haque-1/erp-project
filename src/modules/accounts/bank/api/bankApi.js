/**
 * @file API client methods for AFM Bank and Bank Details.
 * Maps to backend AfmBankController at /api/v1/afm-banks.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const crud = createCrudApi('/afm-banks')

export const bankApi = {
  ...crud,
  list: (params = {}) =>
    unwrapApiResponse(
      apiClient.get('/afm-banks', {
        params:
          typeof params === 'object' && params !== null
            ? params
            : params
            ? { buId: params }
            : undefined,
      }),
    ),
  getDetails: (bankId) =>
    unwrapApiResponse(apiClient.get(`/afm-banks/${bankId}/details`)),
  addDetail: (bankId, payload) =>
    unwrapApiResponse(apiClient.post(`/afm-banks/${bankId}/details`, payload)),
  updateDetail: (bankId, detailId, payload) =>
    unwrapApiResponse(
      apiClient.put(`/afm-banks/${bankId}/details/${detailId}`, payload),
    ),
  removeDetail: (bankId, detailId) =>
    unwrapApiResponse(
      apiClient.delete(`/afm-banks/${bankId}/details/${detailId}`),
    ),
}
