/** @file List-page controller for temporary Vendor / Supplier records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { listVendorSuppliers, removeVendorSupplier, updateVendorSupplier } from '../data/vendorSupplierMasterStore'

const columns = [
  { key: 'VENDOR_NAME', label: 'Vendor Name' },
  { key: 'VENDOR_CODE', label: 'Vendor Code' },
  { key: 'CONTACT_PERSON', label: 'Contact Person' },
  { key: 'PHONE', label: 'Phone' },
  { key: 'EMAIL', label: 'Email' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span>
    ),
  },
]

function VendorSupplierMasterList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listVendorSuppliers())
  const filters = useMemo(() => [
    { key: 'VENDOR_NAME', label: 'Search by Vendor Name', placeholder: '--Search by Vendor Name--', matches: (row, value) => row.VENDOR_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'VENDOR_CODE', label: 'Search by Vendor Code', placeholder: '--Search by Vendor Code--', matches: (row, value) => row.VENDOR_CODE.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])

  const refresh = () => setRows(listVendorSuppliers())
  const handleDelete = (row) => {
    if (!window.confirm(`Delete Vendor / Supplier "${row.VENDOR_NAME}"?`)) return
    removeVendorSupplier(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateVendorSupplier(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return (
    <ListPage
      title={'Vendor / Supplier Master List'}
      createLabel={'New'}
      createTo={'/asset/vendor-supplier-master/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/vendor-supplier-master/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
    />
  )
}

export default VendorSupplierMasterList
