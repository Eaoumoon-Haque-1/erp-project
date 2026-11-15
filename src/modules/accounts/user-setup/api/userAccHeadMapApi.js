/**
 * @file API client for User Account Head Map (AFM_USER_ACC_HEAD_MAP).
 * Maps to backend AfmUserAccHeadMapController at /api/v1/afm-user-acc-head-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/afm-user-acc-head-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const userAccHeadMapApi = {
  ...crud,

  getByUser: (userId, buId) =>
    unwrapApiResponse(
      apiClient.get(RESOURCE_PATH, {
        params: { userId, buId },
      }),
    ),

  saveBulk: (bgId, buId, userId, items) =>
    unwrapApiResponse(
      apiClient.post(`${RESOURCE_PATH}/bulk`, items, {
        params: { bgId, buId, userId },
      }),
    ),
}

export default userAccHeadMapApi
