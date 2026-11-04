/**
 * @file API client for User Setup (AFM_USER_SETUP).
 * Maps to backend AfmUserSetupController at /api/v1/afm-user-setups.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-user-setups'
const crud = createCrudApi(RESOURCE_PATH)

export const userSetupApi = {
  ...crud,

  /**
   * Retrieves all user setups with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, userId, status)
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
   * Retrieves available users with employee mapping for dropdown.
   * @param {number|string} bgId
   * @param {number|string} buId
   */
  getAvailableUsers: (bgId, buId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/available-users`, {
        params: { bgId, buId },
      }),
    ),
}

export default userSetupApi

