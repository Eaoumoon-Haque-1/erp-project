/** @file API-backed list of User Types available for Business Unit assignment. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'

const filters = [
  {
    key: 'USER_TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => row.USER_TYPE_NAME.toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Search by User Type Status',
    placeholder: '--Search by Status--',
    options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
  },
]

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'USER_TYPE_NAME', label: 'Type Name' },
  {
    key: 'STATUS',
    label: 'User Type Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function UserTypeGroupList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([userTypesApi.list(), businessGroupsApi.list()])
      .then(([types, groups]) => {
        if (!active) return
        const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
        setRows(types.map((type) => ({
          ID: String(type.id),
          GROUP_NAME: groupNames.get(String(type.bgId)) || 'N/A',
          USER_TYPE_NAME: type.typeName,
          STATUS: String(type.status ?? 1),
        })))
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load User Types.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <ListPage
      title={'User Type Business Unit Assignments'}
      createLabel={'New'}
      createTo={'/super-admin/user-creation/user-type-group/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          editLabel={'Manage Business Unit assignments'}
          onView={() => navigate(`/super-admin/user-creation/user-type-group/${row.ID}/view`)}
          onEdit={row.STATUS === '1'
            ? () => navigate(`/super-admin/user-creation/user-type-group/${row.ID}/edit`)
            : undefined}
        />
      )}
    />
  )
}

export default UserTypeGroupList
