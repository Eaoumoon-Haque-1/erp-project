/**
 * @file List-page controller for Role.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '../api/roleApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

import { mapRoleFromApi, mapRoleToApi } from '../data/roleApiMapper'

const filters = [
  {
    key: 'PERMISSION_NAME',
    label: 'Search by Role Name',
    placeholder: '--Search by Role Name--',
    matches: (row, value) => String(row.PERMISSION_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
  { key: 'PERMISSION_NAME', label: 'Role Name' },
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

function RoleList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    rolesApi.list()
      .then((records) => {
        if (active) setRows(records.map(mapRoleFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Roles.'))
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
      await rolesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Role.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await rolesApi.update(
        row.ID,
        mapRoleToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID ? mapRoleFromApi(updated) : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Role status.'))
    }
  }

  return (
    <ListPage
      title={'Role List'}
      createLabel={'New'}
      createTo={'/super-admin/role-creation/role/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={(selectedRole) => navigate(`/super-admin/role-creation/role/${selectedRole.ID}/view`)}
          onEdit={(selectedRole) => navigate(`/super-admin/role-creation/role/${selectedRole.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default RoleList
