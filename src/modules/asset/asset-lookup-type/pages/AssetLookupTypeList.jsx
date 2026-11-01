/** @file API-backed list controller for Asset Lookup Type records. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { assetLookupTypesApi } from '../api/assetLookupTypeApi'
import {
  mapAssetLookupTypeFromApi,
  mapAssetLookupTypeToApi,
} from '../data/assetLookupTypeApiMapper'

const filters = [
  {
    key: 'TYPE_NAME',
    label: 'Search by Lookup Type Name',
    placeholder: '--Search by Lookup Type Name--',
    matches: (row, value) => String(row.TYPE_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    key: 'CODE',
    label: 'Search by Lookup Type Code',
    placeholder: '--Search by Lookup Type Code--',
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
  { key: 'TYPE_NAME', label: 'Lookup Type Name' },
  { key: 'CODE', label: 'Lookup Type Code', render: (value) => value || 'N/A' },
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
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    assetLookupTypesApi.list(sessionBusinessUnitId)
      .then((records) => {
        if (active) setRows(records.map(mapAssetLookupTypeFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Lookup Types.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleDelete = async (row) => {
    try {
      await assetLookupTypesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Lookup Type.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetLookupTypesApi.update(
        row.ID,
        mapAssetLookupTypeToApi({
          ...row,
          STATUS: row.STATUS === '1' ? '0' : '1',
        }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapAssetLookupTypeFromApi(updated) : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Lookup Type status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Lookup Type List'}
      createLabel={'New'}
      createTo={'/asset/asset-lookup-type/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-lookup-type/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-lookup-type/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetLookupTypeList

