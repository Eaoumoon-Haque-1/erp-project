/** @file Read-only Role and assigned-permission details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { rolePermissionsApi, rolesApi } from '../api/roleApi'

const viewConfig = {
  title: 'Role View',
  param: 'roleId',
  listTo: '/super-admin/role-creation/role',
  editTo: (id) => `/super-admin/role-creation/role/${id}/edit`,
  loader: async (id) => {
    const [role, details] = await Promise.all([rolesApi.get(id), rolePermissionsApi.getDetails(id)])
    const assignments = (details.assignedPermissions || []).flatMap((group) =>
      (group.permissions || []).map((permission) =>
        `${group.moduleName} / ${group.menuName} / ${permission.permissionName}`),
    )
    return { ...role, assignments: assignments.join(', ') }
  },
  fields: [
    { label: 'Role Name', key: 'roleName' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
    { label: 'Assigned Permissions', key: 'assignments', wide: true },
  ],
}

function RoleView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default RoleView
