/** @file API-backed list controller for Asset Repair records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { getApiErrorMessage } from '../../../../api/errors'
import { assetRepairApi } from '../api/assetRepairApi'
import { mapAssetRepairFromApi, mapAssetRepairToApi } from '../data/assetRepairApiMapper'
import { loadAssetRepairReferences } from '../data/assetRepairOptions'

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'RECEIVE_DATE', label: 'Receive Date', render: (val) => formatDateForDisplay(val) },
  { key: 'RECEIVE_BY_NAME', label: 'Receive By' },
  { key: 'SUPPORT_ENGINEER_NAME', label: 'Support Engineer' },
  { key: 'START_DATE', label: 'Start Date', render: (val) => formatDateForDisplay(val) || 'N/A' },
  { key: 'FINISH_DATE', label: 'Finish Date', render: (val) => formatDateForDisplay(val) || 'N/A' },
  {
    key: 'DELIVERY_DATE',
    label: 'Delivery Date',
    render: (val) => (
      val ? (
        <span className={'font-medium text-emerald-700'}>{formatDateForDisplay(val)}</span>
      ) : (
        <span className={'inline-flex rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800'}>
          Open
        </span>
      )
    ),
  },
  {
    key: 'STATUS',
    label: 'Status',
    render: (val) => (
      <span
        className={[
          'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
          String(val) === '1' ? 'bg-action-success' : 'bg-action-danger',
        ].join(' ')}
      >
        {String(val) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function extractList(response) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.data)) return response.data
  return []
}

function AssetRepairList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = session?.buId ? String(session.buId) : ''
  const sessionGroupId = session?.bgId ? String(session.bgId) : ''

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      assetRepairApi.list(sessionBusinessUnitId).catch(() => []),
      loadAssetRepairReferences(sessionBusinessUnitId),
    ])
      .then(([res, refs]) => {
        if (!active) return
        const mapped = extractList(res).map((rec) => mapAssetRepairFromApi(rec, refs))
        setRows(mapped)
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Failed to load Asset Repairs.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const reload = async () => {
    try {
      const [res, refs] = await Promise.all([
        assetRepairApi.list(sessionBusinessUnitId).catch(() => []),
        loadAssetRepairReferences(sessionBusinessUnitId),
      ])
      const mapped = extractList(res).map((rec) => mapAssetRepairFromApi(rec, refs))
      setRows(mapped)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reload Asset Repairs.'))
    }
  }

  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME_LABEL',
      label: 'Search by Asset Item',
      placeholder: '--Search by Asset Item--',
      matches: (row, val) => (row.ITEM_NAME_LABEL || '').toLowerCase().includes(val.toLowerCase()),
    },
    {
      key: 'REPAIR_STATE',
      label: 'Search by Repair State',
      placeholder: '--Search by Repair State--',
      options: [
        { label: 'Open', value: 'OPEN' },
        { label: 'Delivered', value: 'DELIVERED' },
      ],
      matches: (row, val) => (val === 'OPEN' ? !row.DELIVERY_DATE : Boolean(row.DELIVERY_DATE)),
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
  ], [])

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure you want to delete this Asset Repair record?')) return
    try {
      await assetRepairApi.remove(row.ID)
      reload()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete Asset Repair.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const nextStatus = row.STATUS === '1' ? 0 : 1
      const payload = mapAssetRepairToApi(
        { ...row, STATUS: nextStatus },
        { buId: sessionBusinessUnitId, bgId: sessionGroupId, id: row.ID },
      )
      await assetRepairApi.update(row.ID, payload)
      reload()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to update status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Repair List'}
      createLabel={'New'}
      createTo={'/asset/asset-repair/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-repair/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-repair/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetRepairList
