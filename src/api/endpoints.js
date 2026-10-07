/**
 * @file Typed-by-convention wrappers for every endpoint currently documented
 * by the backend Swagger file.
 *
 * Components call these functions instead of importing Axios directly. That
 * keeps URLs, response unwrapping, and future backend changes centralized.
 * HRIS/Sales APIs absent from Swagger are deliberately not invented here.
 */
import apiClient from './client'

const data = (request) => request.then((response) => response.data)

function createCrudApi(resourcePath) {
  return {
    list: () => data(apiClient.get(resourcePath)),
    get: (id) => data(apiClient.get(`${resourcePath}/${id}`)),
    create: (payload) => data(apiClient.post(resourcePath, payload)),
    update: (id, payload) =>
      data(apiClient.put(`${resourcePath}/${id}`, payload)),
    remove: (id) => data(apiClient.delete(`${resourcePath}/${id}`)),
  }
}

export const usersApi = createCrudApi('/users')
export const userTypesApi = createCrudApi('/user-types')
export const businessGroupsApi = createCrudApi('/business-groups')

export const businessUnitsApi = {
  ...createCrudApi('/business-units'),
  listByGroup: (businessGroupId) =>
    data(apiClient.get(`/business-units/group/${businessGroupId}`)),
}

export const modulesApi = createCrudApi('/modules')

export const menusApi = {
  ...createCrudApi('/menus'),
  listByModule: (moduleId) =>
    data(apiClient.get(`/menus/module/${moduleId}`)),
}

export const permissionsApi = {
  ...createCrudApi('/permissions'),
  listByModule: (moduleId) =>
    data(apiClient.get(`/permissions/module/${moduleId}`)),
}

export const rolesApi = {
  ...createCrudApi('/roles'),
  assignPermissions: (roleId, payload) =>
    data(apiClient.post(`/roles/${roleId}/permissions`, payload)),
  getDetails: (roleId) =>
    data(apiClient.get(`/roles/${roleId}/details`)),
  getAvailablePermissions: (roleId, moduleId, menuId) =>
    data(
      apiClient.get(`/roles/${roleId}/available-permissions`, {
        params: { moduleId, menuId },
      }),
    ),
}

export const roleDetailsApi = {
  ...createCrudApi('/role-details'),
  listByRole: (roleId) =>
    data(apiClient.get(`/role-details/role/${roleId}`)),
  assignPermissions: (roleId, payload) =>
    data(apiClient.post(`/role-details/roles/${roleId}/permissions`, payload)),
  getDetails: (roleId) =>
    data(apiClient.get(`/role-details/roles/${roleId}/details`)),
  getAvailablePermissions: (roleId, moduleId, menuId) =>
    data(
      apiClient.get(
        `/role-details/roles/${roleId}/available-permissions`,
        { params: { moduleId, menuId } },
      ),
    ),
  removePermission: (roleDetailId, permissionId) =>
    data(
      apiClient.delete(
        `/role-details/${roleDetailId}/permissions/${permissionId}`,
      ),
    ),
}

export const businessUnitRolesApi = {
  list: (businessUnitId) =>
    data(apiClient.get(`/business-units/${businessUnitId}/roles`)),
  assign: (businessUnitId, roleId) =>
    data(
      apiClient.post(`/business-units/${businessUnitId}/roles`, { roleId }),
    ),
  remove: (businessUnitId, mappingId) =>
    data(
      apiClient.delete(
        `/business-units/${businessUnitId}/roles/${mappingId}`,
      ),
    ),
}

export const chartOfAccountsApi = createCrudApi('/coa')
