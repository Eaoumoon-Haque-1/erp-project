/** @file API-backed list controller for Unit of Measure (UOM). */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { assetUnitsOfMeasureApi } from '../api/assetUnitOfMeasureApi'
import { mapAssetUnitOfMeasureFromApi, mapAssetUnitOfMeasureToApi } from '../data/assetUnitOfMeasureApiMapper'

const columns = [
  { key: 'UNIT_NAME', label: 'Unit Name' },
  { key: 'SORT_ORDER', label: 'Sort Order', render: (value) => value || 'N/A' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={['inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm', value === '1' ? 'bg-action-success' : 'bg-action-danger'].join(' ')}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function AssetUnitOfMeasureList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    assetUnitsOfMeasureApi.list(sessionBusinessUnitId)
      .then((records) => {
        if (active) setRows(records
          .map(mapAssetUnitOfMeasureFromApi)
          .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Units of Measure.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

  const filters = useMemo(() => [
    { key: 'UNIT_NAME', label: 'Search by Unit Name', placeholder: '--Search by Unit Name--', matches: (row, value) => row.UNIT_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
  ], [])

  const handleDelete = async (row) => {
    try {
      await assetUnitsOfMeasureApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Unit of Measure.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetUnitsOfMeasureApi.update(row.ID, mapAssetUnitOfMeasureToApi({
        ...row,
        STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? mapAssetUnitOfMeasureFromApi(updated) : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Unit of Measure status.'))
    }
  }

  return (
    <ListPage title={'Unit of Measure (UOM) List'} createLabel={'New'} createTo={'/procure-to-pay/procurement-settings/asset-unit-of-measure/create'} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => (
      <ListRowActions
        row={row}
        onView={() => navigate(`/procure-to-pay/procurement-settings/asset-unit-of-measure/${row.ID}/view`)}
        onEdit={() => navigate(`/procure-to-pay/procurement-settings/asset-unit-of-measure/${row.ID}/edit`)}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    )} />
  )
}

export default AssetUnitOfMeasureList
