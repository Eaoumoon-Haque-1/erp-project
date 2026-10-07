/**
 * @file List-page controller for User Type.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import { userTypesApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { mapUserTypeFromApi, mapUserTypeToApi } from '../data/userTypeApiMapper'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'SHORT_NAME', label: 'Short Name', render: (value) => value || 'N/A' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
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

function UserTypeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    userTypesApi.list()
      .then((records) => {
        if (active) {
          setRows(
            records.map((record) => ({
              ...mapUserTypeFromApi(record, currentUser.businessGroup.id),
              GROUP_NAME: currentUser.businessGroup.name,
            })),
          )
        }
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User Types.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete User Type "${row.TYPE_NAME}"?`)) return
    try {
      await userTypesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete User Type.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await userTypesApi.update(
        row.ID,
        mapUserTypeToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) =>
        current.map((item) =>
          item.ID === row.ID
            ? {
                ...item,
                ...mapUserTypeFromApi(updated, currentUser.businessGroup.id),
              }
            : item,
        ),
      )
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update User Type status.'))
    }
  }

  return (
    <ListPage title={'User Type List'} createLabel={'New'} createTo={'/super-admin/user-creation/user-type/create'} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/super-admin/user-creation/user-type/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
  )
}

export default UserTypeList
