/**
 * @file List-page controller for Create Menu.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { menusApi, modulesApi, permissionsApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mapMenuFromApi, mapMenuToApi } from '../data/menuApiMapper'

const filters = [
  {
    key: 'MENU_NAME',
    label: 'Search by Menu Name',
    placeholder: '--Search by Menu Name--',
    matches: (row, value) => String(row.MENU_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
  { key: 'MENU_NAME', label: 'Menu Name' },
  { key: 'PARENT_MENU_NAME', label: 'Parent Menu' },
  { key: 'MODULE_NAME', label: 'Module Name' },
  { key: 'PERMISSION_NAME', label: 'Permission' },
  { key: 'SORT_ORDER', label: 'Sort Order' },
  { key: 'ROUTE_NAME', label: 'Route Name' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function CreateMenuList() {
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
    Promise.all([menusApi.list(), modulesApi.list(), permissionsApi.list()])
      .then(([menus, modules, permissions]) => {
        if (!active) return
        const moduleNames = new Map(
          modules.map((module) => [String(module.id), module.moduleName]),
        )
        const permissionNames = new Map(
          permissions.map((permission) => [
            String(permission.id),
            permission.permissionName,
          ]),
        )
        const menuNames = new Map(
          menus.map((menu) => [String(menu.id), menu.menuName]),
        )
        setModuleOptions(
          modules.map((module) => ({
            value: String(module.id),
            label: module.moduleName,
          })),
        )
        setRows(
          menus.map((menu) => ({
            ...mapMenuFromApi(menu),
            MODULE_NAME:
              moduleNames.get(String(menu.moduleId)) || String(menu.moduleId),
            PERMISSION_NAME:
              permissionNames.get(String(menu.permissionId)) ||
              String(menu.permissionId || ''),
            PARENT_MENU_NAME: menu.parentMenuId
              ? menuNames.get(String(menu.parentMenuId)) || String(menu.parentMenuId)
              : '-',
          })),
        )
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Menus.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete Menu "${row.MENU_NAME}"?`)) return
    try {
      await menusApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
      setMessage('Menu deleted successfully.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Menu.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await menusApi.update(
        row.ID,
        mapMenuToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? {
                ...item,
                ...mapMenuFromApi(updated),
              }
            : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Menu status.'))
    }
  }

  return (
    <ListPage
      title={'Create Menu List'}
      createLabel={'New'}
      createTo={'/super-admin/menu-creation/create-menu/create'}
      filters={activeFilters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() =>
            navigate(`/super-admin/menu-creation/create-menu/${row.ID}/edit`)
          }
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default CreateMenuList
