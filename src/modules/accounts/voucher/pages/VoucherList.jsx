/**
 * @file Account Voucher List page.
 * Displays all accounting vouchers with filters, search, and row actions.
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
import { voucherApi } from '../api/voucherApi'
import { mapVoucherFromApi } from '../data/voucherApiMapper'

const listPath = '/accounts/voucher'
const createPath = '/accounts/voucher/create'

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

function VoucherList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))
  const [lookupTypes, setLookupTypes] = useState([])

  const reloadData = () => {
    if (!sessionBuId) return
    setLoading(true)
    voucherApi
      .list({ buId: sessionBuId })
      .then((data) => {
        setRows(Array.isArray(data) ? data.map((d) => mapVoucherFromApi(d)) : [])
      })
      .catch((err) => {
        showError(getApiErrorMessage(err, 'Unable to load vouchers.'))
        setRows([])
      })
      .finally(() => setLoading(false))
  }

  // Load vouchers on mount / session change
  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    voucherApi
      .list({ buId: sessionBuId })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapVoucherFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load vouchers.'))
        setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBuId])

  // Load Voucher Types from centralized afmLookupData.voucherType
  useEffect(() => {
    if (!sessionBuId) return undefined
    const typeCode = afmLookupData.voucherType
    if (!typeCode) return undefined
    let active = true

    afmLookupApi
      .getValuesByTypeCode(typeCode, sessionBuId, 1)
      .catch(() => afmLookupApi.getValuesByCode(typeCode, sessionBuId, 1))
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

  const handleDelete = async (row) => {
    try {
      await voucherApi.remove(row.ID)
      reloadData()
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete voucher.')
      await showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

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

  // Individual search filters:
  // 1. Voucher No: searchable dropdown with typing / write option
  // 2. Voucher Type: dropdown select
  // 3. Voucher Date: date input picker
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
      title={'Account Vouchers'}
      createLabel={'Create New'}
      createTo={createPath}
      loading={loading}
      filters={filters}
      columns={columns}
      rows={rows}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`${listPath}/${row.ID}/view`)}
          onEdit={() => navigate(`${listPath}/${row.ID}/edit`)}
          onDelete={() => handleDelete(row)}
        />
      )}
    />
  )
}

export default VoucherList
