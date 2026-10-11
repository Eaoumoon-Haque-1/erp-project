/** @file List-page controller for temporary Supplier Information records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { listVendorSuppliers, removeVendorSupplier, updateVendorSupplier } from '../data/vendorSupplierMasterStore'

const columns = [
  { key: 'VENDOR_NAME', label: 'Supplier Name' },
  { key: 'VENDOR_CODE', label: 'Supplier Code' },
  { key: 'CONTACT_PERSON', label: 'Contact Person' },
  { key: 'PHONE', label: 'Phone' },
  { key: 'EMAIL', label: 'Email' },
  { key: 'COMPANY_TYPE', label: 'Company Type', render: (value) => value || 'N/A' },
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
    { key: 'VENDOR_NAME', label: 'Search by Supplier Name', placeholder: '--Search by Supplier Name--', matches: (row, value) => row.VENDOR_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'VENDOR_CODE', label: 'Search by Supplier Code', placeholder: '--Search by Supplier Code--', matches: (row, value) => row.VENDOR_CODE.toLowerCase().includes(value.toLowerCase()) },
    { key: 'COMPANY_TYPE', label: 'Search by Company Type', placeholder: '--Search by Company Type--', matches: (row, value) => String(row.COMPANY_TYPE ?? '').toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])

  const refresh = () => setRows(listVendorSuppliers())
  const handleDelete = (row) => {
    removeVendorSupplier(row.ID)
    refresh()
  }
  const handleStatusChange = (row) => {
    updateVendorSupplier(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    refresh()
  }

  return (
    <ListPage
      title={'Supplier Information List'}
      createLabel={'New'}
      createTo={'/procure-to-pay/procurement-settings/supplier-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/procure-to-pay/procurement-settings/supplier-information/${row.ID}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />}
    />
  )
}

export default VendorSupplierMasterList
