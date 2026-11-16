/**
 * @file Accounts Ledger List page.
 * Displays all accounting ledger records with filters and row actions (View, Edit).
 * Note: New Create Voucher is omitted here as ledgers originate from Account Voucher.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { afmLookupData } from '../../../../config/afmLookupData'
import { afmLookupApi } from '../../afm-lookup/api/afmLookupApi'
import { ledgerApi } from '../api/ledgerApi'
import { mapLedgerFromApi } from '../data/ledgerApiMapper'

const listPath = '/accounts/ledger'

const columns = [
  {
    key: 'VOUCHER_DATE',
    label: 'Voucher Date',
    render: (value) => <span className={'font-medium text-gray-800'}>{value || '-'}</span>,
  },
  {
    key: 'VOUCHER_NO',
    label: 'Voucher No.',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'VOUCHER_TYPE',
    label: 'Voucher Type',
    render: (value) => <span className={'text-gray-700'}>{value || '-'}</span>,
  },
  {
    key: 'PAYMENT_TYPE',
    label: 'Payment Type',
    render: (value) => <span className={'text-gray-600'}>{value || '-'}</span>,
  },
  {
    key: 'PERIOD_NAME',
    label: 'Period',
    render: (value) => <span className={'text-gray-600'}>{value || '-'}</span>,
  },
  {
    key: 'VOUCHER_AMOUNT',
    label: 'Amount',
    render: (value) => (
      <span className={'font-mono font-bold text-gray-900'}>
        {value != null && value !== '' ? Number(value).toFixed(2) : '0.00'}
      </span>
    ),
  },
  {
    key: 'VOUCHER_STATUS',
    label: 'Status',
    render: (value) => {
      const status = String(value || 'DRAFT').toUpperCase()
      const color =
        status === 'APPROVED'
          ? 'bg-emerald-600 text-white'
          : status === 'SUBMITTED'
          ? 'bg-blue-600 text-white'
          : status === 'REJECTED'
          ? 'bg-rose-600 text-white'
          : 'bg-amber-500 text-white'
      return (
        <span
          className={`inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none ${color}`}
        >
          {status}
        </span>
      )
    },
  },
]

function LedgerList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [lookupTypes, setLookupTypes] = useState([])

  const reloadData = () => {
    setLoading(true)
    const params = {}
    if (sessionBuId) params.buId = sessionBuId
    if (sessionBgId) params.bgId = sessionBgId

    ledgerApi
      .list(params)
      .then((data) => {
        setRows(Array.isArray(data) ? data.map((d) => mapLedgerFromApi(d)) : [])
      })
      .catch((err) => {
        showError(getApiErrorMessage(err, 'Unable to load ledgers.'))
        setRows([])
      })
      .finally(() => setLoading(false))
  }

  // Load ledgers on mount / session change
  useEffect(() => {
    let active = true
    setLoading(true)
    const params = {}
    if (sessionBuId) params.buId = sessionBuId
    if (sessionBgId) params.bgId = sessionBgId

    ledgerApi
      .list(params)
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapLedgerFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load ledgers.'))
        setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBuId, sessionBgId])

  // Load Voucher Type lookup values for filtering
  useEffect(() => {
    const typeCode = afmLookupData.voucherType
    if (!typeCode) return undefined
    let active = true

    afmLookupApi
      .getValuesByTypeCode(typeCode, sessionBuId || undefined, 1)
      .catch(() => afmLookupApi.getValuesByCode(typeCode, sessionBuId || undefined, 1))
      .then((data) => {
        if (!active) return
        setLookupTypes(
          (data || []).map((r) => ({
            value: r.value || r.valueCode || String(r.id),
            label: r.value || r.valueCode,
            id: String(r.id),
          })),
        )
      })
      .catch(() => {
        if (active) setLookupTypes([])
      })

    return () => {
      active = false
    }
  }, [sessionBuId])

  // Distinct Voucher Numbers from rows for dropdown + write option
  const voucherNoOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.VOUCHER_NO ?? '').trim()).filter(Boolean)),
    ).sort()
    return distinct.map((no) => ({ value: no, label: no }))
  }, [rows])

  // Voucher Type options: combine lookup types and distinct types in rows
  const voucherTypeOptions = useMemo(() => {
    const typeMap = new Map()
    lookupTypes.forEach((t) => {
      const label = t.label || t.value
      if (label) typeMap.set(label.toLowerCase(), { value: label, label })
    })
    rows.forEach((r) => {
      const val = String(r.VOUCHER_TYPE ?? '').trim()
      if (val && !typeMap.has(val.toLowerCase())) {
        typeMap.set(val.toLowerCase(), { value: val, label: val })
      }
    })
    return Array.from(typeMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [lookupTypes, rows])

  // Individual search filters
  const filters = useMemo(
    () => [
      {
        key: 'VOUCHER_NO',
        label: 'Voucher No.',
        placeholder: '--Select/Write Voucher No.--',
        searchable: true,
        options: voucherNoOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.VOUCHER_NO ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'VOUCHER_TYPE',
        label: 'Voucher Type',
        placeholder: '--Select Voucher Type--',
        options: voucherTypeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          const typeStr = String(row.VOUCHER_TYPE ?? '').toLowerCase()
          const typeIdStr = String(row.VOUCHER_TYPE_ID ?? '').toLowerCase()
          return typeStr === q || typeIdStr === q
        },
      },
      {
        key: 'VOUCHER_DATE',
        label: 'Voucher Date',
        placeholder: 'YYYY-MM-DD',
        type: 'date',
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.VOUCHER_DATE ?? '').toLowerCase().includes(q)
        },
      },
    ],
    [voucherNoOptions, voucherTypeOptions],
  )

  return (
    <ListPage
      title={'Accounts Ledger'}
      loading={loading}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          showUnavailable={false}
          onView={() => navigate(`${listPath}/${row.ID || row.id}/view`)}
          onEdit={() => navigate(`${listPath}/${row.ID || row.id}/edit`)}
        />
      )}
    />
  )
}

export default LedgerList