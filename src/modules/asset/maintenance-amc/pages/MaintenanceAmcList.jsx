/** @file List-page controller for temporary Maintenance / AMC records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listMaintenanceRecords, removeMaintenanceRecord, updateMaintenanceRecord } from '../data/maintenanceAmcStore'

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'MAINTENANCE_TYPE_NAME', label: 'Maintenance Type' },
  { key: 'VENDOR_NAME', label: 'Vendor' },
  { key: 'START_DATE', label: 'Start Date', render: (value) => formatDateForDisplay(value) },
  { key: 'END_DATE', label: 'End Date', render: (value) => formatDateForDisplay(value) || 'N/A' },
  { key: 'COST', label: 'Cost', render: (value) => Number(value || 0).toFixed(2) },
  { key: 'NEXT_DUE_DATE', label: 'Next Due Date', render: (value) => formatDateForDisplay(value) || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function MaintenanceAmcList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listMaintenanceRecords())
  const filters = useMemo(() => [
    { key: 'ITEM_NAME', label: 'Search by Asset Item', placeholder: '--Search by Asset Item--', options: [...new Map(rows.map((row) => [row.ITEM_NAME, { value: row.ITEM_NAME, label: row.ITEM_NAME_LABEL }])).values()] },
    { key: 'MAINTENANCE_TYPE', label: 'Search by Maintenance Type', placeholder: '--Search by Maintenance Type--', options: [...new Map(rows.map((row) => [row.MAINTENANCE_TYPE, { value: row.MAINTENANCE_TYPE, label: row.MAINTENANCE_TYPE_NAME }])).values()] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])
  const refresh = () => setRows(listMaintenanceRecords())
  const handleDelete = (row) => {
    if (!window.confirm(`Delete maintenance record for "${row.ITEM_NAME_LABEL}"?`)) return
    removeMaintenanceRecord(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateMaintenanceRecord(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return <ListPage title={'Maintenance / AMC List'} createLabel={'New'} createTo={'/asset/maintenance-amc/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/maintenance-amc/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default MaintenanceAmcList
