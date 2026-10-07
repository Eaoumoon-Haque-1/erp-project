/** @file List-page controller for temporary Asset assignments. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetAssignments, removeAssetAssignment, updateAssetAssignment } from '../data/assetAssignEmployeeStore'

const columns = [
  { key: 'ASSET_DATE', label: 'Assign Date', render: (value) => formatDateForDisplay(value) },
  { key: 'ASSET_NO', label: 'Asset ID' },
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item Name' },
  { key: 'EMPLOYEE_NAME', label: 'Assigned Employee' },
  { key: 'CONDITION_ON_ISSUE', label: 'Condition', render: (value) => value.charAt(0) + value.slice(1).toLowerCase() },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetAssignEmployeeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetAssignments())
  const filters = useMemo(() => [
    { key: 'ASSET_NO', label: 'Search by Asset ID', placeholder: '--Search by Asset ID--', matches: (row, value) => row.ASSET_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'HR_EMPL_ID', label: 'Search by Employee', placeholder: '--Search by Employee--', options: [...new Map(rows.map((row) => [row.HR_EMPL_ID, { value: row.HR_EMPL_ID, label: row.EMPLOYEE_NAME }])).values()] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])

  const refresh = () => setRows(listAssetAssignments())
  const handleDelete = (row) => {
    if (!window.confirm(`Delete assignment for "${row.ASSET_NO}"?`)) return
    removeAssetAssignment(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateAssetAssignment(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return (
    <ListPage
      title={'Asset Assign to Employee List'}
      createLabel={'New'}
      createTo={'/asset/asset-assign-to-employee/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-assign-to-employee/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
    />
  )
}

export default AssetAssignEmployeeList
