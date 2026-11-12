/**
 * @file Supplier Information List page.
 * Displays all suppliers with individual search options, filters, and row actions.
 * Group Name and Business Unit are retrieved from session data and hidden from filter/columns.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { supplierApi } from '../api/supplierApi'
import { mapSupplierFromApi, mapSupplierToApi } from '../data/supplierApiMapper'
import { SUPPLIER_TYPE_OPTIONS } from '../validation/supplierValidation'

const columns = [
  {
    key: 'SUPPLIER_CODE',
    label: 'Supplier Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'SUPPLIER_NAME',
    label: 'Supplier Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'SUPPLIER_TYPE',
    label: 'Supplier Type',
    render: (value) => <span className={'text-xs text-gray-700'}>{value || '-'}</span>,
  },
  {
    key: 'CONTACT_PERSON',
    label: 'Contact Person',
    render: (value) => <span className={'text-xs text-gray-700'}>{value || '-'}</span>,
  },
  {
    key: 'PHONE',
    label: 'Phone',
    render: (value) => <span className={'text-xs text-gray-700'}>{value || '-'}</span>,
  },
  {
    key: 'EMAIL',
    label: 'Email',
    render: (value) => (
      <span className={'text-xs text-blue-600 truncate max-w-[150px] block'}>{value || '-'}</span>
    ),
  },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none',
          String(value) === '1' ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function SupplierList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/accounts/voucher-setup/supplier')
    ? '/accounts/voucher-setup/supplier'
    : '/accounts/supplier'
  const createPath = `${listPath}/create`

  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    supplierApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map(mapSupplierFromApi) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load suppliers.'))
        setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBuId, sessionBgId])

  const handleDelete = async (row) => {
    try {
      await supplierApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
      showSuccess('Supplier deleted successfully')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete supplier.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapSupplierFromApi(await supplierApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await supplierApi.update(
        row.ID,
        mapSupplierToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
      showSuccess(`Supplier status changed to ${nextStatus === '1' ? 'Active' : 'Inactive'}`)
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update supplier status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // Distinct options derived from rows for individual dropdown search with write option
  const supplierCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.SUPPLIER_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((code) => ({ value: code, label: code }))
  }, [rows])

  const supplierNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.SUPPLIER_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // Filters for ListPage
  const filters = useMemo(
    () => [
      {
        key: 'SUPPLIER_CODE',
        label: 'Supplier Code',
        placeholder: '--Select/Write Supplier Code--',
        searchable: true,
        options: supplierCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.SUPPLIER_CODE ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'SUPPLIER_NAME',
        label: 'Supplier Name',
        placeholder: '--Select/Write Supplier Name--',
        searchable: true,
        options: supplierNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.SUPPLIER_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'SUPPLIER_TYPE',
        label: 'Supplier Type',
        placeholder: '--Select Type--',
        options: SUPPLIER_TYPE_OPTIONS.map((t) => ({ value: t, label: t })),
        matches: (row, value) => {
          if (!value) return true
          return String(row.SUPPLIER_TYPE || '').trim().toLowerCase() === String(value).trim().toLowerCase()
        },
      },
      {
        key: 'STATUS',
        label: 'Status',
        placeholder: '--Select Status--',
        options: [
          { value: '1', label: 'Active' },
          { value: '0', label: 'Inactive' },
        ],
        matches: (row, value) => {
          if (value === '' || value == null) return true
          return String(row.STATUS) === String(value)
        },
      },
    ],
    [supplierCodeOptions, supplierNameOptions],
  )

  return (
    <ListPage
      title={'Supplier Information'}
      createLabel={'New Supplier'}
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
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default SupplierList

