/** @file API-backed list controller for Asset Disposal / Retirement records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { getApiErrorMessage } from '../../../../api/errors'
import { assetDisposalApi } from '../api/assetDisposalApi'
import { mapAssetDisposalFromApi, mapAssetDisposalToApi } from '../data/assetDisposalApiMapper'
import { loadAssetDisposalReferences } from '../data/assetDisposalOptions'

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'DISPOSAL_DATE', label: 'Disposal Date', render: (val) => formatDateForDisplay(val) },
  { key: 'DISPOSAL_TYPE_NAME', label: 'Disposal Type' },
  { key: 'DISPOSAL_VALUE', label: 'Disposal Value', render: (val) => Number(val || 0).toFixed(2) },
  { key: 'WRITTEN_DOWN_VALUE', label: 'WDV', render: (val) => Number(val || 0).toFixed(2) },
  { key: 'APPROVED_BY_NAME', label: 'Approved By', render: (val) => val || 'N/A' },
  {
    key: 'DISPOSAL_STATUS',
    label: 'Disposal Status',
    render: (val) => {
      const text = String(val || '').charAt(0) + String(val || '').slice(1).toLowerCase()
      const colors = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SUBMITTED: 'bg-blue-100 text-blue-800',
        APPROVED: 'bg-emerald-100 text-emerald-800',
        REJECTED: 'bg-rose-100 text-rose-800',
        COMPLETED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-amber-100 text-amber-800',
      }
      return (
        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${colors[val] || 'bg-gray-100 text-gray-800'}`}>
          {text}
        </span>
      )
    },
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

function AssetDisposalList() {
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
      assetDisposalApi.list(sessionBusinessUnitId).catch(() => []),
      loadAssetDisposalReferences(sessionBusinessUnitId),
    ])
      .then(([res, refs]) => {
        if (!active) return
        const mapped = extractList(res).map((rec) => mapAssetDisposalFromApi(rec, refs))
        setRows(mapped)
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Failed to load Asset Disposals.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const reload = async () => {
    try {
      const [res, refs] = await Promise.all([
        assetDisposalApi.list(sessionBusinessUnitId).catch(() => []),
        loadAssetDisposalReferences(sessionBusinessUnitId),
      ])
      const mapped = extractList(res).map((rec) => mapAssetDisposalFromApi(rec, refs))
      setRows(mapped)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reload Asset Disposals.'))
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
      key: 'DISPOSAL_STATUS',
      label: 'Search by Disposal Status',
      placeholder: '--Search by Disposal Status--',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'COMPLETED', label: 'Completed' },
      ],
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
    if (!window.confirm('Are you sure you want to delete this Asset Disposal record?')) return
    try {
      await assetDisposalApi.remove(row.ID)
      reload()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete Asset Disposal.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const nextStatus = row.STATUS === '1' ? 0 : 1
      const payload = mapAssetDisposalToApi(
        { ...row, STATUS: nextStatus },
        { buId: sessionBusinessUnitId, bgId: sessionGroupId, id: row.ID },
      )
      await assetDisposalApi.update(row.ID, payload)
      reload()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to update status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Disposal / Retirement List'}
      createLabel={'New'}
      createTo={'/asset/asset-disposal-retirement/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-disposal-retirement/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-disposal-retirement/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetDisposalList
