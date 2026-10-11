/** @file List-page controller for temporary Unit of Measure (UOM) records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { listAssetUnitsOfMeasure, removeAssetUnitOfMeasure, updateAssetUnitOfMeasure } from '../data/assetUnitOfMeasureStore'

const columns = [
  { key: 'UNIT_NAME', label: 'Unit Name' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetUnitOfMeasureList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetUnitsOfMeasure())
  const filters = useMemo(() => [
    { key: 'UNIT_NAME', label: 'Search by Unit Name', placeholder: '--Search by Unit Name--', matches: (row, value) => row.UNIT_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])
  const refresh = () => setRows(listAssetUnitsOfMeasure())
  const handleDelete = (row) => { removeAssetUnitOfMeasure(row.ID); refresh() }
  const handleStatusChange = (row) => { updateAssetUnitOfMeasure(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }); refresh() }
  return <ListPage title={'Unit of Measure (UOM) List'} createLabel={'New'} createTo={'/procure-to-pay/procurement-settings/asset-unit-of-measure/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/procure-to-pay/procurement-settings/asset-unit-of-measure/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default AssetUnitOfMeasureList
