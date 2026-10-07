/** @file List controller for temporary Asset Lookup Value records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listAssetLookupValues,
  removeAssetLookupValue,
  updateAssetLookupValue,
} from '../data/assetLookupValueStore'

const columns = [
  { key: 'GROUP_NAME', label: 'Group Name' },
  { key: 'TYPE_NAME', label: 'Type' },
  { key: 'VALUE', label: 'Value' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
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

function AssetLookupValueList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetLookupValues())
  const filters = useMemo(() => [
    {
      key: 'TYPE_NAME',
      label: 'Search by Type',
      placeholder: '--Search by Type--',
      options: [...new Map(rows.map((row) => [row.TYPE_NAME, { label: row.TYPE_NAME, value: row.TYPE_NAME }])).values()],
    },
    {
      key: 'VALUE',
      label: 'Search by Value',
      placeholder: '--Search by Value--',
      matches: (row, value) => String(row.VALUE ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [rows])

  const handleDelete = (row) => {
    if (!window.confirm(`Delete Asset Lookup Value "${row.VALUE}"?`)) return
    removeAssetLookupValue(row.ID)
    setRows(listAssetLookupValues())
  }

  const handleStatusChange = (row) => {
    updateAssetLookupValue(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    setRows(listAssetLookupValues())
  }

  return (
    <ListPage
      title={'Asset Lookup Value List'}
      createLabel={'New'}
      createTo={'/asset/asset-lookup-value/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-lookup-value/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetLookupValueList

