/**
 * @file Customer Information List page.
 * Displays all customers with individual search options, filters, and row actions.
 * Group Name and Business Unit are retrieved from session data and hidden from filter/columns.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError, showSuccess } from '../../../../components/shared/actionAlerts'
import { customerApi } from '../api/customerApi'
import { mapCustomerFromApi, mapCustomerToApi } from '../data/customerApiMapper'
import { CUSTOMER_TYPE_OPTIONS } from '../validation/customerValidation'

const columns = [
  {
    key: 'CUSTOMER_CODE',
    label: 'Customer Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'CUSTOMER_NAME',
    label: 'Customer Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'CUSTOMER_TYPE',
    label: 'Customer Type',
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
    key: 'CREDIT_LIMIT',
    label: 'Credit Limit',
    render: (value) => (
      <span className={'text-xs font-medium text-gray-800'}>
        {value != null ? Number(value).toFixed(2) : '0.00'}
      </span>
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

function CustomerList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/accounts/voucher-setup/customer')
    ? '/accounts/voucher-setup/customer'
    : '/accounts/customer'
  const createPath = `${listPath}/create`

  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    customerApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map(mapCustomerFromApi) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load customers.'))
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
      await customerApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
      showSuccess('Customer deleted successfully')
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete customer.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapCustomerFromApi(await customerApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await customerApi.update(
        row.ID,
        mapCustomerToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
      showSuccess(`Customer status changed to ${nextStatus === '1' ? 'Active' : 'Inactive'}`)
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update customer status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // Distinct options derived from rows for individual dropdown search with write option
  const customerCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.CUSTOMER_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((code) => ({ value: code, label: code }))
  }, [rows])

  const customerNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.CUSTOMER_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // Filters for ListPage
  const filters = useMemo(
    () => [
      {
        key: 'CUSTOMER_CODE',
        label: 'Customer Code',
        placeholder: '--Select/Write Customer Code--',
        searchable: true,
        options: customerCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.CUSTOMER_CODE ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'CUSTOMER_NAME',
        label: 'Customer Name',
        placeholder: '--Select/Write Customer Name--',
        searchable: true,
        options: customerNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.CUSTOMER_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'CUSTOMER_TYPE',
        label: 'Customer Type',
        placeholder: '--Select Type--',
        options: CUSTOMER_TYPE_OPTIONS.map((t) => ({ value: t, label: t })),
        matches: (row, value) => {
          if (!value) return true
          return String(row.CUSTOMER_TYPE || '').trim().toLowerCase() === String(value).trim().toLowerCase()
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
    [customerCodeOptions, customerNameOptions],
  )

  return (
    <ListPage
      title={'Customer Information'}
      createLabel={'New Customer'}
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

export default CustomerList

