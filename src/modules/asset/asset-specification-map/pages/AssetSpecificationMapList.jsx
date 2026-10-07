/** @file List-page controller for temporary Asset Specification Mapping records. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  listAssetSpecificationMaps,
  removeAssetSpecificationMap,
  updateAssetSpecificationMap,
} from '../data/assetSpecificationMapStore'

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item Name' },
  { key: 'SPECIFICATION_NAME', label: 'Specification' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
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

function AssetSpecificationMapList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => listAssetSpecificationMaps())
  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME',
      label: 'Search by Asset Item',
      placeholder: '--Search by Asset Item--',
      options: [...new Map(rows.map((row) => [row.ITEM_NAME, {
        value: row.ITEM_NAME,
        label: row.ITEM_NAME_LABEL,
      }])).values()],
    },
    {
      key: 'SPECIFICATION',
      label: 'Search by Specification',
      placeholder: '--Search by Specification--',
      options: [...new Map(rows.map((row) => [row.SPECIFICATION, {
        value: row.SPECIFICATION,
        label: row.SPECIFICATION_NAME,
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
    if (!window.confirm(
      `Delete ${row.SPECIFICATION_NAME} mapping for ${row.ITEM_NAME_LABEL}?`,
    )) return
    removeAssetSpecificationMap(row.ID)
    setRows(listAssetSpecificationMaps())
  }

  const handleStatusChange = (row) => {
    updateAssetSpecificationMap(row.ID, {
      ...row,
      STATUS: row.STATUS === '1' ? '0' : '1',
    })
    setRows(listAssetSpecificationMaps())
  }

  return (
    <ListPage
      title={'Asset Specification Mapping List'}
      createLabel={'New'}
      createTo={'/asset/asset-specification-map/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onEdit={() => navigate(`/asset/asset-specification-map/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetSpecificationMapList
