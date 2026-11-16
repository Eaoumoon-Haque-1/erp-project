/**
 * @file API client for Accounts Ledger (AFM_LEDGER, AFM_LEDGER_DETAIL, AFM_LEDGER_ATTACH).
 * Maps to backend AfmLedgerController at /api/v1/afm-ledgers.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-ledgers'
const crud = createCrudApi(RESOURCE_PATH)

export const ledgerApi = {
  ...crud,

  /**
   * Retrieves all ledgers with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, voucherType, status, fromDate, toDate)
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
   * Retrieves a ledger by ID including detail lines and attachments.
   * @param {number|string} id Ledger ID
   */
  get: (id) => unwrapApiResponse(apiClient.get(`${RESOURCE_PATH}/${id}`)),

  /**
   * Retrieves a ledger by voucher number and Business Unit.
   * @param {number|string} buId Business Unit ID
   * @param {string} voucherNo Voucher No
   */
  getByNo: (buId, voucherNo) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/by-no`, {
        params: { buId, voucherNo },
      }),
    ),

  /**
   * Retrieves cost centers for a given Business Unit.
   * @param {number|string} buId Business Unit ID
   */
  getCostCenters: (buId) =>
    unwrapApiResponse(
      apiClient.get('/afm-cost-centers', {
        params: { buId, status: 1 },
      }),
    ),
}

export default ledgerApi
