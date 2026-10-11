/**
 * @file List-page controller for Menu Permission.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { modulesApi } from '../../module/api/moduleApi'
import { permissionsApi } from '../api/menuPermissionApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  mapPermissionFromApi,
  mapPermissionToApi,
} from '../data/menuPermissionApiMapper'

const filters = [
  {
    key: 'PERMISSION_NAME',
    label: 'Search by Permission Name',
    placeholder: '--Search by Permission Name--',
    matches: (row, value) => String(row.PERMISSION_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'MODULE_ID',
    label: 'Search by Module Name',
    placeholder: '--Search by Module Name--',
    options: [
      { label: 'Super Admin', value: '1' },
      { label: 'HRIS', value: '2' },
    ],
  },
  {
    key: 'STATUS',
    label: 'Search by Status',
    placeholder: '--Search by Status--',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  },
]

const columns = [
  { key: 'PERMISSION_NAME', label: 'Permission Name' },
  { key: 'MODULE_NAME', label: 'Module Name' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function MenuPermissionList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [moduleOptions, setModuleOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const activeFilters = useMemo(
    () =>
      filters.map((filter) =>
        filter.key === 'MODULE_ID' ? { ...filter, options: moduleOptions } : filter,
      ),
    [moduleOptions],
  )

  useEffect(() => {
    let active = true
    Promise.all([permissionsApi.list(), modulesApi.list()])
      .then(([permissions, modules]) => {
        if (!active) return
        const names = new Map(
          modules.map((module) => [String(module.id), module.moduleName]),
        )
        setModuleOptions(
          modules.map((module) => ({
            value: String(module.id),
            label: module.moduleName,
          })),
        )
        setRows(
          permissions.map((permission) => ({
            ...mapPermissionFromApi(permission),
            MODULE_NAME:
              names.get(String(permission.moduleId)) || String(permission.moduleId),
          })),
        )
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Permissions.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (row) => {
    try {
      await permissionsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Permission.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await permissionsApi.update(
        row.ID,
        mapPermissionToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? { ...mapPermissionFromApi(updated), MODULE_NAME: row.MODULE_NAME }
            : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Permission status.'))
    }
  }

  return (
    <ListPage
      title={'Menu Permission List'}
      createLabel={'New'}
      createTo={'/super-admin/menu-creation/menu-permission/create'}
      filters={activeFilters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() =>
            navigate(`/super-admin/menu-creation/menu-permission/${row.ID}/view`)
          }
          onEdit={() =>
            navigate(`/super-admin/menu-creation/menu-permission/${row.ID}/edit`)
          }
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default MenuPermissionList
