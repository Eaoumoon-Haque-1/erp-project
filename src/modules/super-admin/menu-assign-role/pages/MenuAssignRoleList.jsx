/** @file API-backed RoleDetail list for Menu Assign to Role operations. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { menusApi } from '../../create-menu/api/menuApi'
import { permissionsApi } from '../../menu-permission/api/menuPermissionApi'
import { modulesApi } from '../../module/api/moduleApi'
import { rolePermissionsApi, rolesApi } from '../../role/api/roleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  buildRoleDetailLookups,
  mapRoleDetailFromApi,
} from '../data/menuAssignRoleApiMapper'

const filters = [
  { key: 'ROLE_NAME', label: 'Role Name', placeholder: '--Search by Role Name--', matches: (row, value) => row.ROLE_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'MODULE_NAME', label: 'Module Name', placeholder: '--Search by Module--', matches: (row, value) => row.MODULE_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]

const columns = [
  { key: 'ROLE_NAME', label: 'Role Name' },
  { key: 'MODULE_NAME', label: 'Module Name' },
  { key: 'MENU_NAME', label: 'Menu Name' },
  { key: 'PERMISSION_NAME', label: 'Permissions' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white ${value === '1' ? 'bg-action-success' : 'bg-action-danger'}`}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function MenuAssignRoleList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      rolePermissionsApi.list(),
      rolesApi.list(),
      modulesApi.list(),
      menusApi.list(),
      permissionsApi.list(),
    ])
      .then(([details, roles, modules, menus, permissions]) => {
        if (!active) return
        const nextLookups = buildRoleDetailLookups({ roles, modules, menus, permissions })
        setLookups(nextLookups)
        setRows(details.map((detail) => mapRoleDetailFromApi(detail, nextLookups)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Menu Assign to Role records.'))
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const remove = async (row) => {
    try {
      await rolePermissionsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Menu assignment.'))
      return false
    }
  }

  const changeStatus = async (row) => {
    try {
      const nextStatus = row.STATUS === '1' ? 0 : 1
      const updated = await rolePermissionsApi.update(row.ID, {
        ...row.API_RECORD,
        status: nextStatus,
      })
      const updatedRecord = updated && typeof updated === 'object'
        ? updated
        : { ...row.API_RECORD, status: nextStatus }
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapRoleDetailFromApi(updatedRecord, lookups) : item
      )))
      return true
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Menu assignment status.'))
      return false
    }
  }

  return (
    <ListPage
      title={'Menu Assign to Role List'}
      createLabel={'New'}
      createTo={'/super-admin/role-creation/menu-assign-role/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          entityName={'Menu assignment'}
          onView={() => navigate(`/super-admin/role-creation/menu-assign-role/${row.ID}/view`)}
          onEdit={() => navigate(`/super-admin/role-creation/menu-assign-role/create?roleId=${row.ROLE_ID}`)}
          onDelete={remove}
          onStatusChange={changeStatus}
        />
      )}
    />
  )
}

export default MenuAssignRoleList
