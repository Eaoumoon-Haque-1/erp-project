/** @file API-backed role list used as the entry point for assigning menus/permissions. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '../../role/api/roleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const filters = [
  { key: 'ROLE_NAME', label: 'Role Name', placeholder: '--Search by Role Name--', matches: (row, value) => row.ROLE_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]
const columns = [
  { key: 'ROLE_NAME', label: 'Role Name' },
  { key: 'ASSIGNED_PERMISSIONS', label: 'Assigned Permissions' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white ${value === '1' ? 'bg-action-success' : 'bg-action-danger'}`}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function MenuAssignRoleList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    rolesApi.list()
      .then(async (roles) => {
        const details = await Promise.all(roles.map((role) => rolesApi.getDetails(role.id).catch(() => ({ assignedPermissions: [] }))))
        if (!active) return
        setRows(roles.map((role, index) => ({
          ID: String(role.id), ROLE_NAME: role.roleName, STATUS: String(role.isActive ?? role.status ?? 1),
          ASSIGNED_PERMISSIONS: String((details[index].assignedPermissions || []).reduce((total, group) => total + (group.permissions || []).length, 0)),
        })))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load roles.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <ListPage title={'Menu Assign to Role List'} createLabel={'New'} createTo={'/super-admin/role-creation/menu-assign-role/create'} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/super-admin/role-creation/menu-assign-role/create?roleId=${row.ID}`)} />} />
}

export default MenuAssignRoleList
