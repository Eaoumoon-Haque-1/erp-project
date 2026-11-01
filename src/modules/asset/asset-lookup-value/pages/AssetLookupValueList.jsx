/** @file API-backed list controller for Asset Lookup Value records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../api/assetLookupValueApi'
import {
  mapAssetLookupValueFromApi,
  mapAssetLookupValueToApi,
} from '../data/assetLookupValueApiMapper'

const basePath = '/asset/asset-lookup-value'

function sortOrderValue(value) {
  if (value === '' || value == null) return Number.POSITIVE_INFINITY
  const number = Number(value)
  return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY
}

const columns = [
  { key: 'TYPE_NAME', label: 'Lookup Type' },
  { key: 'VALUE', label: 'Lookup Value' },
  { key: 'VALUE_CODE', label: 'Lookup Value Code', render: (value) => value || 'N/A' },
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
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const filters = useMemo(() => [
    {
      key: 'TYPE_ID',
      label: 'Search by Lookup Type',
      placeholder: '--Search by Lookup Type--',
      options: typeOptions,
    },
    {
      key: 'VALUE',
      label: 'Search by Lookup Value',
      placeholder: '--Search by Lookup Value--',
      matches: (row, value) => String(row.VALUE ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'VALUE_CODE',
      label: 'Search by Lookup Value Code',
      placeholder: '--Search by Lookup Value Code--',
      matches: (row, value) => String(row.VALUE_CODE ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [typeOptions])

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupValuesApi.list({ businessUnitId: sessionBusinessUnitId }),
      assetLookupTypesApi.list(sessionBusinessUnitId),
    ])
      .then(([records, types]) => {
        if (!active) return
        const typeNames = new Map(types.map((type) => [String(type.id), type.typeName]))
        setTypeOptions(types.map((type) => ({
          value: String(type.id),
          label: type.typeName,
        })))
        setRows(records
          .map((record) => mapAssetLookupValueFromApi(
            record,
            typeNames.get(String(record.typeId)) || String(record.typeId ?? 'N/A'),
          ))
          .sort((left, right) => (
            sortOrderValue(left.SORT_ORDER) - sortOrderValue(right.SORT_ORDER)
          )))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Lookup Values.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleDelete = async (row) => {
    try {
      await assetLookupValuesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Lookup Value.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetLookupValuesApi.update(
        row.ID,
        mapAssetLookupValueToApi({ ...row, STATUS: row.STATUS === '1' ? '0' : '1' }),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID
          ? mapAssetLookupValueFromApi(updated, row.TYPE_NAME)
          : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Lookup Value status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Lookup Value List'}
      createLabel={'New'}
      createTo={`${basePath}/create`}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${basePath}/${row.ID}/view`)}
          onEdit={() => navigate(`${basePath}/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetLookupValueList
