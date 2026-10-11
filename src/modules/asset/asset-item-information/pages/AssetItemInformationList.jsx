/** @file List-page controller for temporary Asset Item Information records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listAssetItems,
  removeAssetItem,
  updateAssetItem,
} from '../data/assetItemInformationStore'

const columns = [
  { key: 'ITEM_NAME', label: 'Item Name' },
  { key: 'ITEM_GROUP_NAME', label: 'Item Group' },
  { key: 'DEPRI_CATEGORY_NAME', label: 'Depreciation Category' },
  { key: 'CATEGORY_TYPE', label: 'Asset Type' },
  { key: 'UOM_NAME', label: 'UOM' },
  { key: 'ASSET_OWNER', label: 'Asset Owner' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetItemInformationList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetItems())
  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME',
      label: 'Search by Item Name',
      placeholder: '--Search by Item Name--',
      matches: (row, value) => row.ITEM_NAME.toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'ITEM_GROUP',
      label: 'Search by Item Group',
      placeholder: '--Search by Item Group--',
      options: [...new Map(rows.map((row) => [row.ITEM_GROUP, {
        value: row.ITEM_GROUP,
        label: row.ITEM_GROUP_NAME,
      }])).values()],
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
  ], [rows])

  const handleDelete = (row) => {
    removeAssetItem(row.ID)
    setRows(listAssetItems())
  }

  const handleStatusChange = (row) => {
    updateAssetItem(row.ID, { ...row, STATUS: row.STATUS === '1' ? '0' : '1' })
    setRows(listAssetItems())
  }

  return (
    <ListPage
      title={'Asset Item Information List'}
      createLabel={'New'}
      createTo={'/asset/asset-item-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-item-information/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetItemInformationList
