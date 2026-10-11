/** @file Read-only Menu details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { permissionsApi } from '../../menu-permission/api/menuPermissionApi'
import { modulesApi } from '../../module/api/moduleApi'
import { menusApi } from '../api/menuApi'
import { parsePermissionIds } from '../data/menuApiMapper'

const toNameMap = (records, labelKey) =>
  new Map(records.map((record) => [String(record.id), record[labelKey]]))

const viewConfig = {
  title: 'Menu View',
  param: 'menuId',
  listTo: '/super-admin/menu-creation/create-menu',
  editTo: (id) => `/super-admin/menu-creation/create-menu/${id}/edit`,
  loader: async (id) => {
    const [menu, modules, permissions, menus] = await Promise.all([
      menusApi.get(id),
      modulesApi.list(),
      permissionsApi.list(),
      menusApi.list(),
    ])
    const moduleNames = toNameMap(modules, 'moduleName')
    const permissionNames = toNameMap(permissions, 'permissionName')
    const menuNames = toNameMap(menus, 'menuName')

    return {
      ...menu,
      moduleName: moduleNames.get(String(menu.moduleId)),
      parentMenuName: menu.parentMenuId ? menuNames.get(String(menu.parentMenuId)) : '-',
      permissionNames: parsePermissionIds(menu.permissionIds ?? menu.permissionId)
        .map((permissionId) => permissionNames.get(permissionId) || permissionId)
        .join(', '),
    }
  },
  fields: [
    { label: 'Menu Name', key: 'menuName' },
    { label: 'Is Top Menu?', key: 'isTopMenu', type: 'boolean' },
    { label: 'Is Parent Menu?', key: 'isParent', type: 'boolean' },
    { label: 'Parent Menu', key: 'parentMenuName' },
    { label: 'Module Name', key: 'moduleName' },
    { label: 'Permissions', key: 'permissionNames' },
    { label: 'Route Name', key: 'routeName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function CreateMenuView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default CreateMenuView
