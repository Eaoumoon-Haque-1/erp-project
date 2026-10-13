/** @file Dedicated read-only view for a RoleDetail menu-permission assignment. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { menusApi } from '../../create-menu/api/menuApi'
import { permissionsApi } from '../../menu-permission/api/menuPermissionApi'
import { modulesApi } from '../../module/api/moduleApi'
import { rolePermissionsApi, rolesApi } from '../../role/api/roleApi'
import {
  buildRoleDetailLookups,
  mapRoleDetailFromApi,
} from '../data/menuAssignRoleApiMapper'

const viewConfig = {
  title: 'Menu Assign to Role View',
  param: 'menuAssignmentId',
  listTo: '/super-admin/role-creation/menu-assign-role',
  editTo: (_, record) => `/super-admin/role-creation/menu-assign-role/create?roleId=${record.ROLE_ID}`,
  loader: async (id) => {
    const [detail, roles, modules, menus, permissions] = await Promise.all([
      rolePermissionsApi.get(id),
      rolesApi.list(),
      modulesApi.list(),
      menusApi.list(),
      permissionsApi.list(),
    ])
    const lookups = buildRoleDetailLookups({ roles, modules, menus, permissions })
    return mapRoleDetailFromApi(detail, lookups)
  },
  fields: [
    { label: 'Role Name', key: 'ROLE_NAME' },
    { label: 'Module Name', key: 'MODULE_NAME' },
    { label: 'Menu Name', key: 'MENU_NAME' },
    { label: 'Permissions', key: 'PERMISSION_NAME', wide: true },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function MenuAssignRoleView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default MenuAssignRoleView
