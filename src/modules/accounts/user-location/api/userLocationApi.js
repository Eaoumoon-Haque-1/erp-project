/**
 * @file API client for User Location (AFM_USER_LOCATION).
 * Maps to backend AfmUserLocationController at /api/v1/afm-user-locations.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-user-locations'
const crud = createCrudApi(RESOURCE_PATH)

export const userLocationApi = {
  ...crud,

  /**
   * Retrieves all user locations with optional filtering.
   * @param {object} [params={}] Filter params (bgId, buId, location, status)
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
}

export default userLocationApi

