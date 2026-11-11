/**
 * @file API client for Warehouse Employee Map (INV_ITEM_WAREHS_EMPL_MAP).
 * Maps to backend InvItemWarehouseEmployeeMapController at /api/v1/inv-item-warehouse-employee-maps.
 */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

const RESOURCE_PATH = '/inv-item-warehouse-employee-maps'
const crud = createCrudApi(RESOURCE_PATH)

export const itemWarehouseEmployeeMapApi = {
  ...crud,

  /**
   * Retrieves all assigned employees for a warehouse.
   * @param {number|string} warehouseId
   */
  getByWarehouseId: (warehouseId) =>
    unwrapApiResponse(
      apiClient.get(`${RESOURCE_PATH}/warehouse/${warehouseId}`),
    ),

  /**
   * Assigns employees to a warehouse.
   * @param {object} payload { warehouseId, employeeIds, employeeId, bgId, buId, status }
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
   * Removes an employee from a warehouse by warehouseId and employeeId.
   * @param {number|string} warehouseId
   * @param {number|string} employeeId
   */
  removeByWarehouseAndEmployee: (warehouseId, employeeId) =>
    unwrapApiResponse(
      apiClient.delete(`${RESOURCE_PATH}/warehouse/${warehouseId}/employee/${employeeId}`),
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

export default itemWarehouseEmployeeMapApi
