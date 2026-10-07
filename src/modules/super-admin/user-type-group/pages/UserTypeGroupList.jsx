/**
 * @file List-page controller for User Type Group.
 * Sections: filter/column/temporary-row configuration, row handlers, and ListPage composition.
 * Edit here when list columns, filters, navigation, API rows, or enabled actions change.
 */
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'

const rows = [{ ID: '1', GROUP_NAME: 'Health Expert', USER_TYPE_NAME: 'Admin User', STATUS: '1' }]
const filters = [
  { key: 'USER_TYPE_NAME', label: 'Search by Type Name', placeholder: '--Search by Type Name--', matches: (row, value) => row.USER_TYPE_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]
const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'USER_TYPE_NAME', label: 'Type Name' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function UserTypeGroupList() {
  const navigate = useNavigate()
  return <ListPage title={'User Type Group List'} createLabel={'New'} createTo={'/super-admin/user-creation/user-type-group/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={(selected) => navigate(`/super-admin/user-creation/user-type-group/${selected.ID}/edit`)} />} />
}

export default UserTypeGroupList
