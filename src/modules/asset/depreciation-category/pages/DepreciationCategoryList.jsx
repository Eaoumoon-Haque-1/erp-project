/** @file List controller for temporary Depreciation Category records. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listDepreciationCategories,
  removeDepreciationCategory,
  updateDepreciationCategory,
} from '../data/depreciationCategoryStore'

const filters = [
  { key: 'DEPRI_CATEGORY', label: 'Search by Category', placeholder: '--Search by Category--', matches: (row, value) => row.DEPRI_CATEGORY.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]
const columns = [
  { key: 'DEPRI_CATEGORY', label: 'Depreciation Category' },
  { key: 'DEPRI_METHOD_NAME', label: 'Depreciation Method' },
  { key: 'ASSET_TYPE_NAME', label: 'Asset Type' },
  { key: 'DEPRI_LIFE', label: 'Life (Months)' },
  { key: 'DEPRI_PERCENTAGE', label: 'Depreciation (%)' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm ${value === '1' ? 'bg-action-success' : 'bg-action-danger'}`}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function DepreciationCategoryList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listDepreciationCategories())
  const remove = (row) => { if (!window.confirm(`Delete Depreciation Category "${row.DEPRI_CATEGORY}"?`)) return; removeDepreciationCategory(row.ID); setRows(listDepreciationCategories()) }
  const toggle = (row) => { updateDepreciationCategory(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' }); setRows(listDepreciationCategories()) }
  return <ListPage title={'Depreciation Category List'} createLabel={'New'} createTo={'/asset/depreciation-category/create'} filters={filters} columns={columns} rows={rows} renderActions={(row) => <ListRowActions row={row} onEdit={() => navigate(`/asset/depreciation-category/${row.ID}/edit`)} onDelete={remove} onStatusChange={toggle} />} />
}

export default DepreciationCategoryList

