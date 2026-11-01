/** @file API-backed Asset Item Information list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { assetItemsApi } from '../api/assetItemApi'
import { mapAssetItemFromApi, mapAssetItemToApi } from '../data/assetItemApiMapper'
import { loadAssetItemReferences } from '../data/assetItemInformationOptions'

const columns = [
  { key: 'ITEM_NAME', label: 'Item Name' },
  { key: 'ITEM_GROUP_NAME', label: 'Item Group' },
  { key: 'DEPRI_CATEGORY_NAME', label: 'Depreciation Category' },
  { key: 'CATEGORY_TYPE', label: 'Asset Type', render: (value) => value || 'N/A' },
  { key: 'UOM_NAME', label: 'UOM' },
  { key: 'ASSET_OWNER', label: 'Asset Owner', render: (value) => value || 'N/A' },
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
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetItemReferences(sessionBusinessUnitId, sessionGroupId),
      assetItemsApi.list(sessionBusinessUnitId),
    ])
      .then(([references, records]) => {
        if (active) setRows(records.map((record) => mapAssetItemFromApi(record, references)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Items.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

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
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [rows])

  const handleDelete = async (row) => {
    try {
      await assetItemsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Item.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetItemsApi.update(row.ID, mapAssetItemToApi({
        ...row,
        STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? { ...item, STATUS: String(updated.status ?? item.STATUS) } : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Item status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Item Information List'}
      createLabel={'New'}
      createTo={'/asset/asset-item-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-item-information/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-item-information/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetItemInformationList
