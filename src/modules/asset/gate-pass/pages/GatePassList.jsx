/** @file API-backed list controller for Gate Pass records. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { gatePassApi } from '../api/gatePassApi'
import { mapGatePassFromApi, mapGatePassToApi } from '../data/gatePassApiMapper'
import { getInitialGatePassReferences, loadGatePassReferences } from '../data/gatePassOptions'

const columns = [
  { key: 'GATE_PASS_NO', label: 'Gate Pass No' },
  { key: 'GATE_PASS_DATE', label: 'Gate Pass Date', render: (value) => formatDateForDisplay(value) },
  { key: 'SUPPLIER_NAME', label: 'Supplier' },
  { key: 'CUSTODIAN_NAME', label: 'Custodian' },
  { key: 'ITEM_SUMMARY', label: 'Asset Items' },
  { key: 'TOTAL_QUANTITY', label: 'Total Quantity' },
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

function toListRows(records) {
  return records.map((record) => ({
    ...record,
    ITEM_SUMMARY: record.ITEMS?.map((row) => row.ITEM_NAME_LABEL).filter(Boolean).join(', ') || 'N/A',
    TOTAL_QUANTITY: record.ITEMS?.reduce((total, row) => total + Number(row.QUANTITY || 0), 0) || 0,
  }))
}

function GatePassList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [references, setReferences] = useState(getInitialGatePassReferences)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([
      gatePassApi.list(sessionBusinessUnitId),
      loadGatePassReferences(sessionBusinessUnitId),
    ])
      .then(([records, refs]) => {
        if (!active) return
        setReferences(refs)
        const mapped = (records || []).map((r) => mapGatePassFromApi(r, refs))
        setRows(toListRows(mapped))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Gate Passes.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [sessionBusinessUnitId])

  const filters = useMemo(() => [
    {
      key: 'GATE_PASS_NO',
      label: 'Search by Gate Pass No',
      placeholder: '--Search by Gate Pass No--',
      matches: (row, value) => String(row.GATE_PASS_NO ?? '').toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: 'SUPPLIER_NAME',
      label: 'Search by Supplier',
      placeholder: '--Search by Supplier--',
      matches: (row, value) => String(row.SUPPLIER_NAME ?? '').toLowerCase().includes(value.toLowerCase()),
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
      await gatePassApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Gate Pass.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const nextStatus = row.STATUS === '1' ? '0' : '1'
      const payload = mapGatePassToApi(
        { ...row, STATUS: nextStatus },
        row.ITEMS,
        { bgId: sessionGroupId || row.BG_ID, buId: sessionBusinessUnitId || row.BU_ID },
      )
      const updated = await gatePassApi.update(row.ID, payload)
      const mapped = mapGatePassFromApi(updated, references)
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? { ...toListRows([mapped])[0] } : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Gate Pass status.'))
    }
  }

  return (
    <ListPage
      title={'Gate Pass List'}
      createLabel={'New'}
      createTo={'/asset/gate-pass/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/gate-pass/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/gate-pass/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default GatePassList
