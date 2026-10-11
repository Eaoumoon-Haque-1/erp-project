/** @file Read-only Menu Permission details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { modulesApi } from '../../module/api/moduleApi'
import { permissionsApi } from '../api/menuPermissionApi'

const viewConfig = {
  title: 'Menu Permission View',
  param: 'permissionId',
  listTo: '/super-admin/menu-creation/menu-permission',
  editTo: (id) => `/super-admin/menu-creation/menu-permission/${id}/edit`,
  loader: async (id) => {
    const permission = await permissionsApi.get(id)
    const module = permission.moduleId ? await modulesApi.get(permission.moduleId) : null
    return { ...permission, moduleName: module?.moduleName }
  },
  fields: [
    { label: 'Permission Name', key: 'permissionName' },
    { label: 'Module Name', key: 'moduleName' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function MenuPermissionView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default MenuPermissionView
