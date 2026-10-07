/** @file List-page controller for temporary Asset Disposal / Retirement records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetDisposals, removeAssetDisposal, updateAssetDisposal } from '../data/assetDisposalStore'

const columns = [
  { key: 'ASSET_NO', label: 'Asset ID' }, { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'DISPOSAL_DATE', label: 'Disposal Date', render: (value) => formatDateForDisplay(value) },
  { key: 'DISPOSAL_TYPE_NAME', label: 'Disposal Type' },
  { key: 'DISPOSAL_VALUE', label: 'Disposal Value', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'GAIN_ON_DISPOSAL', label: 'Gain', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'LOSS_ON_DISPOSAL', label: 'Loss', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'DISPOSAL_STATUS', label: 'Disposal Status', render: (value) => String(value || '').charAt(0) + String(value || '').slice(1).toLowerCase() },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetDisposalList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetDisposals())
  const filters = useMemo(() => [
    { key: 'ASSET_NO', label: 'Search by Asset ID', placeholder: '--Search by Asset ID--', matches: (row, value) => row.ASSET_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'DISPOSAL_STATUS', label: 'Search by Disposal Status', placeholder: '--Search by Disposal Status--', options: [...new Set(rows.map((row) => row.DISPOSAL_STATUS))].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])
  const refresh = () => setRows(listAssetDisposals())
  const handleDelete = (row) => { if (!window.confirm(`Delete disposal record for "${row.ASSET_NO}"?`)) return; removeAssetDisposal(row.ID); refresh() }
  const handleStatusChange = (row) => { updateAssetDisposal(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }); refresh() }
  return <ListPage title={'Asset Disposal / Retirement List'} createLabel={'New'} createTo={'/asset/asset-disposal-retirement/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-disposal-retirement/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default AssetDisposalList
