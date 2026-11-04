/**
 * @file User Location List page.
 * Displays all user locations with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { userLocationApi } from '../api/userLocationApi'
import { mapUserLocationFromApi, mapUserLocationToApi } from '../data/userLocationApiMapper'

const listPath = '/accounts/voucher-setup/user-location'
const createPath = '/accounts/voucher-setup/user-location/create'

const columns = [
  {
    key: 'LOCATION',
    label: 'Location',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'SHORT_NAME',
    label: 'Short Name',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
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

function UserLocationList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    userLocationApi
      .list({ buId: sessionBuId })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapUserLocationFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load user locations.'))
        setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionBuId])

  const handleDelete = async (row) => {
    try {
      await userLocationApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete user location.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapUserLocationFromApi(await userLocationApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await userLocationApi.update(
        row.ID,
        mapUserLocationToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update user location status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Location options (distinct from rows for searchable dropdown with write option)
  const locationOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.LOCATION ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((loc) => ({ value: loc, label: loc }))
  }, [rows])

  // 2. Short Name options (distinct from rows for standard dropdown field)
  const shortNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.SHORT_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((sn) => ({ value: sn, label: sn }))
  }, [rows])

  // Individual Search Options:
  // 1. Location with dropdown field with write option (searchable: true)
  // 2. Short Name with dropdown field
  // 3. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'LOCATION',
        label: 'Location',
        placeholder: '--Select/Write Location--',
        searchable: true,
        options: locationOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.LOCATION ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'SHORT_NAME',
        label: 'Short Name',
        placeholder: '--Select Short Name--',
        options: shortNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.SHORT_NAME ?? '').trim().toLowerCase() === q
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
    [locationOptions, shortNameOptions],
  )

  return (
    <ListPage
      title={'User Locations'}
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

export default UserLocationList
