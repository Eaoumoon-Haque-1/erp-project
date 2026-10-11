/** @file List controller for temporary Asset Group records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listAssetGroups,
  removeAssetGroup,
  updateAssetGroup,
} from '../data/assetGroupStore'

const columns = [
  { key: 'ASSET_GROUP', label: 'Asset Group' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner' },
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

function AssetGroupList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetGroups())
  const filters = useMemo(() => [
    {
      key: 'ASSET_GROUP',
      label: 'Search by Asset Group',
      placeholder: '--Search by Asset Group--',
      matches: (row, value) => String(row.ASSET_GROUP ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'ASSET_OWNER_ID',
      label: 'Search by Asset Owner',
      placeholder: '--Search by Asset Owner--',
      options: [...new Map(rows.map((row) => [row.ASSET_OWNER_ID, {
        value: row.ASSET_OWNER_ID,
        label: row.ASSET_OWNER_NAME,
      }])).values()],
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [rows])

  const handleDelete = (row) => {
    removeAssetGroup(row.ID)
    setRows(listAssetGroups())
  }

  const handleStatusChange = (row) => {
    updateAssetGroup(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    setRows(listAssetGroups())
  }

  return (
    <ListPage
      title={'Asset Group List'}
      createLabel={'New'}
      createTo={'/asset/asset-group/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-group/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetGroupList

