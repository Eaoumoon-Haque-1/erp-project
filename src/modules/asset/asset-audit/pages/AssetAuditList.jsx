/** @file List-page controller for temporary Asset Audit records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetAudits, removeAssetAudit, updateAssetAudit } from '../data/assetAuditStore'

const columns = [
  { key: 'ASSET_NO', label: 'Asset ID' },
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'DISPOSAL_DATE', label: 'Disposal Date', render: (value) => formatDateForDisplay(value) },
  { key: 'DISPOSAL_TYPE_NAME', label: 'Disposal Type' },
  { key: 'DISPOSAL_VALUE', label: 'Disposal Value', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'APPROVED_BY_NAME', label: 'Approved By', render: (value) => value || 'N/A' },
  { key: 'DISPOSAL_STATUS', label: 'Disposal Status', render: (value) => String(value || '').charAt(0) + String(value || '').slice(1).toLowerCase() },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetAuditList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetAudits())
  const filters = useMemo(() => [
    { key: 'ASSET_NO', label: 'Search by Asset ID', placeholder: '--Search by Asset ID--', matches: (row, value) => row.ASSET_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'DISPOSAL_STATUS', label: 'Search by Disposal Status', placeholder: '--Search by Disposal Status--', options: [...new Set(rows.map((row) => row.DISPOSAL_STATUS))].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])
  const refresh = () => setRows(listAssetAudits())
  const handleDelete = (row) => { removeAssetAudit(row.ID); refresh() }
  const handleStatusChange = (row) => { updateAssetAudit(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }); refresh() }
  return <ListPage title={'Asset Audit List'} createLabel={'New'} createTo={'/asset/asset-audit/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-audit/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default AssetAuditList
