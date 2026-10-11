/** @file List-page controller for temporary Asset Repair records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetRepairs, removeAssetRepair, updateAssetRepair } from '../data/assetRepairStore'

const columns = [
  { key: 'ASSET_NO', label: 'Asset ID' }, { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'RECEIVE_DATE', label: 'Receive Date', render: (value) => formatDateForDisplay(value) },
  { key: 'RECEIVE_BY_NAME', label: 'Receive By' }, { key: 'SUPPORT_ENGINEER_NAME', label: 'Support Engineer' },
  { key: 'START_DATE', label: 'Start Date', render: (value) => formatDateForDisplay(value) || 'N/A' },
  { key: 'FINISH_DATE', label: 'Finish Date', render: (value) => formatDateForDisplay(value) || 'N/A' },
  { key: 'DELIVERY_DATE', label: 'Delivery Date', render: (value) => formatDateForDisplay(value) || 'Open' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetRepairList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetRepairs())
  const filters = useMemo(() => [
    { key: 'ASSET_NO', label: 'Search by Asset ID', placeholder: '--Search by Asset ID--', matches: (row, value) => row.ASSET_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'REPAIR_STATE', label: 'Search by Repair State', placeholder: '--Search by Repair State--', options: [{ label: 'Open', value: 'OPEN' }, { label: 'Delivered', value: 'DELIVERED' }], matches: (row, value) => value === 'OPEN' ? !row.DELIVERY_DATE : Boolean(row.DELIVERY_DATE) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])
  const refresh = () => setRows(listAssetRepairs())
  const handleDelete = (row) => { removeAssetRepair(row.ID); refresh() }
  const handleStatusChange = (row) => { updateAssetRepair(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }); refresh() }
  return <ListPage title={'Asset Repair List'} createLabel={'New'} createTo={'/asset/asset-repair/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-repair/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default AssetRepairList
