/**
 * @file API client for Store Employee Map (INV_ITEM_STORE_EMPL_MAP).
 * Maps to backend InvItemStoreEmployeeMapController at /api/v1/inv-item-store-employee-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-store-employee-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const itemStoreEmployeeMapApi = {
  ...crud,

  /**
   * Retrieves all assigned employees for a store.
   * @param {number|string} storeId
   */
  getByStoreId: (storeId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/store/${storeId}`),
    ),

  /**
   * Assigns employees to a store.
   * @param {object} payload { storeId, employeeIds, employeeId, bgId, buId, status }
   */
  assignEmployees: (payload) =>
    unwrapApiResponse(
      apiClient.post(`${RESOURCE_PATH}/assign`, payload),
    ),

  /**
   * Deletes a mapping by mapping ID.
   * @param {number|string} id
   */
  delete: (id) =>
    unwrapApiResponse(
      apiClient.delete(`${RESOURCE_PATH}/${id}`),
    ),

  /**
   * Removes an employee from a store by storeId and employeeId.
   * @param {number|string} storeId
   * @param {number|string} employeeId
   */
  removeByStoreAndEmployee: (storeId, employeeId) =>
    unwrapApiResponse(
      apiClient.delete(`${RESOURCE_PATH}/store/${storeId}/employee/${employeeId}`),
    ),

  /**
   * Updates assignment status (1=Active, 0=Inactive).
   * @param {number|string} id
   * @param {number} status
   */
  updateStatus: (id, status) =>
    unwrapApiResponse(
      apiClient.patch(`${RESOURCE_PATH}/${id}/status?status=${status}`, { status }),
    ),
}

export default itemStoreEmployeeMapApi

