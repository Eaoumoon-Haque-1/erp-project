/** @file Role master CRUD and the single shared Role Permission contract. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const rolesApi = createCrudApi('/roles')
const roleDetailCrudApi = createCrudApi('/role-details')

// Both Role Edit and Menu Assign to Role must use this adapter. Role master
// CRUD belongs to Role Controller; every permission relationship operation
// belongs to Role Details Controller.
export const rolePermissionsApi = {
  ...roleDetailCrudApi,
  assignPermissions: (roleId, payload) =>
    unwrapApiResponse(apiClient.post(`/role-details/roles/${roleId}/permissions`, payload)),
  getDetails: (roleId) =>
    unwrapApiResponse(apiClient.get(`/role-details/roles/${roleId}/details`)),
  getAvailablePermissions: (roleId, moduleId, menuId) =>
    unwrapApiResponse(apiClient.get(`/role-details/roles/${roleId}/available-permissions`, {
      params: { moduleId, menuId },
    })),
  removePermission: (roleDetailId, permissionId) =>
    unwrapApiResponse(apiClient.delete(`/role-details/${roleDetailId}/permissions/${permissionId}`)),
}
