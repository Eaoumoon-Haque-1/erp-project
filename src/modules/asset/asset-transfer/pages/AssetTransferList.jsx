/** @file List-page controller for temporary Asset Transfer records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetTransfers, removeAssetTransfer, updateAssetTransfer } from '../data/assetTransferStore'

const formatCondition = (value) => String(value || '').split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
const columns = [
  { key: 'ASSET_NO', label: 'Asset ID' },
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item Name' },
  { key: 'FROM_LOCATION_NAME', label: 'From Location' },
  { key: 'TO_LOCATION_NAME', label: 'To Location' },
  { key: 'TO_ASSIGN_DATE', label: 'Transfer Date', render: (value) => formatDateForDisplay(value) },
  { key: 'TO_CONDITION_ON_ISSUE', label: 'Condition', render: formatCondition },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetTransferList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetTransfers())
  const filters = useMemo(() => [
    { key: 'ASSET_NO', label: 'Search by Asset ID', placeholder: '--Search by Asset ID--', matches: (row, value) => row.ASSET_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])
  const refresh = () => setRows(listAssetTransfers())
  const handleDelete = (row) => {
    if (!window.confirm(`Delete transfer for "${row.ASSET_NO}"?`)) return
    removeAssetTransfer(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateAssetTransfer(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return <ListPage title={'Asset Transfer List'} createLabel={'New'} createTo={'/asset/asset-transfer/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-transfer/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default AssetTransferList
