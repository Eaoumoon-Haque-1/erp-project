/** @file API-backed list controller for Asset Transfer records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { assetTransferApi } from '../api/assetTransferApi'
import { mapAssetTransferFromApi } from '../data/assetTransferApiMapper'
import { loadAssetTransferReferences } from '../data/assetTransferOptions'

const formatCondition = (value) => (
  String(value || '')
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
)

const columns = [
  { key: 'ITEM_NAME_LABEL', label: 'Asset Item' },
  { key: 'FROM_LOCATION_NAME', label: 'From Location', render: (val) => val || '—' },
  { key: 'TO_LOCATION_NAME', label: 'To Location', render: (val) => val || '—' },
  { key: 'TO_ASSIGN_DATE', label: 'Transfer Date', render: (value) => formatDateForDisplay(value) },
  { key: 'TO_CONDITION_ON_ISSUE', label: 'Condition', render: formatCondition },
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

function AssetTransferList() {
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
      assetTransferApi.list(sessionBusinessUnitId),
      loadAssetTransferReferences(sessionBusinessUnitId, sessionGroupId),
    ])
      .then(([records, refs]) => {
        if (!active) return
        const mapped = (records || []).map((r) => mapAssetTransferFromApi(r, refs))
        setRows(mapped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Transfers.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME_LABEL',
      label: 'Search by Asset Item',
      placeholder: '--Search by Asset Item--',
      matches: (row, value) => String(row.ITEM_NAME_LABEL ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'TO_LOCATION_NAME',
      label: 'Search by To Location',
      placeholder: '--Search by To Location--',
      matches: (row, value) => String(row.TO_LOCATION_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [])

  const handleDelete = async (row) => {
    try {
      await assetTransferApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Transfer.'))
    }
  }

  return (
    <ListPage
      title={'Asset Transfer List'}
      createLabel={'New'}
      createTo={'/asset/asset-transfer/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-transfer/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-transfer/${row.ID}/edit`)}
          onDelete={handleDelete}
        />
      )}
    />
  )
}

export default AssetTransferList
