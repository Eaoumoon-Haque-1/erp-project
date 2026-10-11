/** @file Role CRUD and Role Permission endpoint contracts. */
import apiClient from '../../../../api/client'
import { createCrudApi, unwrapApiResponse } from '../../../../api/createCrudApi'

export const rolesApi = {
  ...createCrudApi('/roles'),
  assignPermissions: (roleId, payload) =>
    unwrapApiResponse(apiClient.post(`/roles/${roleId}/permissions`, payload)),
  getDetails: (roleId) =>
    unwrapApiResponse(apiClient.get(`/roles/${roleId}/details`)),
  getAvailablePermissions: (roleId, moduleId, menuId) =>
    unwrapApiResponse(apiClient.get(`/roles/${roleId}/available-permissions`, {
      params: { moduleId, menuId },
    })),
}

export const roleDetailsApi = {
  ...createCrudApi('/role-details'),
  listByRole: (roleId) =>
    unwrapApiResponse(apiClient.get(`/role-details/role/${roleId}`)),
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
