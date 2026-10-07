/** @file List controller for temporary Asset Lookup Type records. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listAssetLookupTypes,
  removeAssetLookupType,
  updateAssetLookupType,
} from '../data/assetLookupTypeStore'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Type Name',
    placeholder: '--Search by Type Name--',
    matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'CODE',
    label: 'Search by Code',
    placeholder: '--Search by Code--',
    matches: (row, value) => String(row.CODE ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'STATUS',
    label: 'Search by Status',
    placeholder: '--Search by Status--',
    options: [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
    ],
  },
]

const columns = [
  { key: 'TYPE_NAME', label: 'Type Name' },
  { key: 'CODE', label: 'Code', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        String(value) === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetLookupTypeList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetLookupTypes())

  const handleDelete = (row) => {
    if (!window.confirm(`Delete Asset Lookup Type "${row.TYPE_NAME}"?`)) return
    removeAssetLookupType(row.ID)
    setRows(listAssetLookupTypes())
  }

  const handleStatusChange = (row) => {
    updateAssetLookupType(row.ID, {
      ...row,
      STATUS: row.STATUS === '1' ? '0' : '1',
    })
    setRows(listAssetLookupTypes())
  }

  return (
    <ListPage
      title={'Asset Lookup Type List'}
      createLabel={'New'}
      createTo={'/asset/asset-lookup-type/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-lookup-type/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetLookupTypeList

