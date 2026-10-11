/** @file List-page controller for temporary Asset Receive Register records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { listAssetReceives, removeAssetReceive, updateAssetReceive } from '../data/assetReceiveRegisterStore'

const columns = [
  { key: 'GRN_NO', label: 'Receive No (GRN)' },
  { key: 'GRN_DATE', label: 'Receive Date', render: (value) => formatDateForDisplay(value) },
  { key: 'PURCHASE_DATE', label: 'Purchase Date', render: (value) => formatDateForDisplay(value) },
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item Name' },
  { key: 'SUPPLIER_NAME', label: 'Vendor / Supplier' },
  { key: 'QTY', label: 'Qty' },
  { key: 'CAPITALIZED_COST', label: 'Capitalized Cost' },
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

function AssetReceiveRegisterList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetReceives())
  const filters = useMemo(() => [
    { key: 'GRN_NO', label: 'Search by GRN', placeholder: '--Search by GRN--', matches: (row, value) => row.GRN_NO.toLowerCase().includes(value.toLowerCase()) },
    { key: 'ITEM_NAME', label: 'Search by Asset Item', placeholder: '--Search by Asset Item--', options: [...new Map(rows.map((row) => [row.ITEM_NAME, { value: row.ITEM_NAME, label: row.ITEM_NAME_LABEL }])).values()] },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [rows])

  const refresh = () => setRows(listAssetReceives())
  const handleDelete = (row) => {
    removeAssetReceive(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateAssetReceive(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return (
    <ListPage
      title={'Asset Receive Register List'}
      createLabel={'New'}
      createTo={'/asset/asset-receive-register/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/asset-receive-register/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
    />
  )
}

export default AssetReceiveRegisterList
