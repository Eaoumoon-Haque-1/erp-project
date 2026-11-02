/**
 * @file API client for Accounting Period Open (AFM_PERIOD).
 * Maps to backend AfmPeriodController at /api/v1/afm-periods.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-periods'
const crud = createCrudApi(RESOURCE_PATH)

export const periodApi = {
  ...crud,

  /**
   * Retrieves all accounting periods with optional filtering.
   * @param {object} [params={}] Query params (bgId, buId, periodYear, periodStatus, status)
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
   * Retrieves open period names from AFM_CALENDAR_MONTH for a given BU and Year.
   * @param {number|string} buId Business Unit ID
   * @param {string} year Calendar Year
   */
  getOpenPeriods: (buId, year) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/open-periods`, {
        params: { buId, year },
      }),
    ),

  /**
   * Retrieves distinct calendar years registered in AFM_CALENDAR for a BU.
   * @param {number|string} buId Business Unit ID
   */
  getAvailableYears: (buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/years`, {
        params: { buId },
      }),
    ),
}

export default periodApi

