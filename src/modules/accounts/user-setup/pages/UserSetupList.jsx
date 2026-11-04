/**
 * @file User Setup List page.
 * Displays all user setups with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { userSetupApi } from '../api/userSetupApi'
import { mapUserSetupFromApi, mapUserSetupToApi } from '../data/userSetupApiMapper'

const listPath = '/accounts/voucher-setup/user-setup'
const createPath = '/accounts/voucher-setup/user-setup/create'

const columns = [
  {
    key: 'USER_DISPLAY_LABEL',
    label: 'User Name',
    render: (value, row) => (
      <span className={'font-bold text-gray-900'}>
        {value || row.USER_NAME || '-'}
      </span>
    ),
  },
  {
    key: 'VOUCHER_DATE',
    label: 'Voucher Date',
    render: (value) => (
      <span className={'text-xs text-gray-700'}>
        {Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'}
      </span>
    ),
  },
  {
    key: 'VOUCHER_TYPE_DEFAULT_NAME',
    label: 'Default Voucher Type',
    render: (value, row) => (
      <span className={'text-xs text-gray-800'}>
        {value || row.VOUCHER_TYPE_DEFAULT || '-'}
      </span>
    ),
  },
  {
    key: 'LOCATION_DEFAULT_NAME',
    label: 'Default Location',
    render: (value, row) => (
      <span className={'text-xs text-gray-800'}>
        {value || row.LOCATION_DEFAULT || '-'}
      </span>
    ),
  },
  {
    key: 'BANK_ACCOUNT_DEFAULT_NAME',
    label: 'Default Bank Account',
    render: (value, row) => (
      <span className={'text-xs text-gray-800'}>
        {value || row.BANK_ACCOUNT_DEFAULT || '-'}
      </span>
    ),
  },
  {
    key: 'COST_CENTER_DEFAULT_NAME',
    label: 'Default Cost Center',
    render: (value, row) => (
      <span className={'text-xs text-gray-800'}>
        {value || row.COST_CENTER_DEFAULT || '-'}
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

function UserSetupList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    userSetupApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapUserSetupFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load user setups.'))
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
      await userSetupApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete user setup.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapUserSetupFromApi(await userSetupApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await userSetupApi.update(
        row.ID,
        mapUserSetupToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update user setup status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // User Name options for Searchable dropdown with write option
  const userNameOptions = useMemo(() => {
    const map = new Map()
    rows.forEach((r) => {
      const label = r.USER_DISPLAY_LABEL || r.USER_NAME
      if (label && !map.has(label)) {
        map.set(label, { value: label, label })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [rows])

  // Individual Search Options:
  // 1. User Name with dropdown field with write option (searchable: true)
  // 2. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'USER_NAME',
        label: 'User Name',
        placeholder: '--Select/Write User Name--',
        searchable: true,
        options: userNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          const searchStr = `${row.USER_NAME || ''} ${row.USER_DISPLAY_LABEL || ''} ${row.EMPLOYEE_CODE || ''} ${row.EMPLOYEE_NAME || ''}`.toLowerCase()
          return searchStr.includes(q)
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
    [userNameOptions],
  )

  return (
    <ListPage
      title={'User Setup'}
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
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default UserSetupList

