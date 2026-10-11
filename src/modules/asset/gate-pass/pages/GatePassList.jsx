/** @file List-page controller for temporary Gate Pass records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listGatePasses, removeGatePass, updateGatePass } from '../data/gatePassStore'

const columns = [
  { key: 'GATE_PASS_NO', label: 'Gate Pass No' },
  { key: 'GATE_PASS_DATE', label: 'Gate Pass Date', render: (value) => formatDateForDisplay(value) },
  { key: 'SUPPLIER_NAME', label: 'Supplier' },
  { key: 'CUSTODIAN_NAME', label: 'Custodian' },
  { key: 'ITEM_SUMMARY', label: 'Asset Items' },
  { key: 'TOTAL_QUANTITY', label: 'Total Quantity' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function toListRows(records) {
  return records.map((record) => ({ ...record, ITEM_SUMMARY: record.ITEMS.map((row) => row.ITEM_NAME_LABEL).join(', ') || 'N/A', TOTAL_QUANTITY: record.ITEMS.reduce((total, row) => total + Number(row.QUANTITY || 0), 0) }))
}

function GatePassList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => toListRows(listGatePasses()))
  const filters = useMemo(() => [
    { key: 'GATE_PASS_NO', label: 'Search by Gate Pass No', placeholder: '--Search by Gate Pass No--', matches: (row, value) => row.GATE_PASS_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'SUPPLIER_NAME', label: 'Search by Supplier', placeholder: '--Search by Supplier--', matches: (row, value) => row.SUPPLIER_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])
  const refresh = () => setRows(toListRows(listGatePasses()))
  const handleDelete = (row) => { removeGatePass(row.ID); refresh() }
  const handleStatusChange = (row) => { updateGatePass(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1', ITEMS: row.ITEMS }); refresh() }
  return <ListPage title={'Gate Pass List'} createLabel={'New'} createTo={'/asset/gate-pass/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/gate-pass/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />} />
}

export default GatePassList
