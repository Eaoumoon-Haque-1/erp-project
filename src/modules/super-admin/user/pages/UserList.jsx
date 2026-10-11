/**
 * @file List-page controller for User.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { usersApi } from '../api/userApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mapUserFromApi } from '../data/userApiMapper'

const filters = [
  { key: 'USER_NAME', label: 'Search by User Name', placeholder: '--Search by User Name--', matches: (row, value) => String(row.USER_NAME ?? '').toLowerCase().includes(value.toLowerCase()) },
  { key: 'ROLE_ID', label: 'Search by User Role', placeholder: '--Search by User Role--', options: [{ label: 'Super Admin', value: '1' }, { label: 'Administrator', value: '2' }] },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]

const columns = [
  { key: 'USER_NAME', label: 'User Name' },
  { key: 'FULL_NAME', label: 'Full Name' },
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'ROLE_NAME', label: 'User Role' },
  { key: 'USER_TYPE_NAME', label: 'User Type' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', String(value) === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{String(value) === '1' ? 'Active' : 'Inactive'}</span> },
]

function UserList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const activeFilters = useMemo(
    () => filters.map((filter) =>
      filter.key === 'ROLE_ID' ? { ...filter, options: roleOptions } : filter,
    ),
    [roleOptions],
  )

  useEffect(() => {
    let active = true
    Promise.all([usersApi.list(), rolesApi.list(), userTypesApi.list(), businessUnitsApi.list()])
      .then(([users, roles, userTypes, units]) => {
        if (!active) return
        const lookups = {
          businessGroupId: currentUser.businessGroup.id,
          roles: new Map(roles.map((role) => [String(role.id), role.roleName])),
          userTypes: new Map(userTypes.map((type) => [String(type.id), type.userType])),
          businessUnits: new Map(units.map((unit) => [String(unit.id), unit.businessUnit])),
        }
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setRows(users.map((user) => mapUserFromApi(user, lookups)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Users.'))
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
      await usersApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete User.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await usersApi.update(row.ID, {
        ...row.API_RECORD,
        isActive: row.STATUS === '1' ? 0 : 1,
      })
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.isActive ?? 1), API_RECORD: updated }
            : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update User status.'))
    }
  }

  return <ListPage title={'User List'} createLabel={'New'} createTo={'/super-admin/user-creation/user/create'} filters={activeFilters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => <ListRowActions row={row} onView={() => navigate(`/super-admin/user-creation/user/${row.ID}/view`)} onEdit={() => navigate(`/super-admin/user-creation/user/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default UserList
