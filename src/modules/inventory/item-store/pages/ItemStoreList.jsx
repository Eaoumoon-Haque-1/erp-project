/**
 * @file Item Store List page.
 * Displays all item stores with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { itemStoreApi } from '../api/itemStoreApi'
import { mapItemStoreFromApi, mapItemStoreToApi } from '../data/itemStoreApiMapper'

const defaultListPath = '/procure-to-pay/procurement-settings/item-store'

const columns = [
  {
    key: 'STORE_CODE',
    label: 'Store Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'STORE_NAME',
    label: 'Store Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'IS_DEFAULT',
    label: 'Is Default?',
    render: (value) => (
      <span
        className={[
          'inline-flex rounded-[4px] px-2 py-0.5 text-[11px] font-bold leading-none',
          String(value) === '1' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700',
        ].join(' ')}
      >
        {String(value) === '1' ? 'Yes' : 'No'}
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

function ItemStoreList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-store'
    : defaultListPath
  const createPath = `${listPath}/create`

  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? '').trim()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    itemStoreApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapItemStoreFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load item stores.'))
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
      await itemStoreApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete item store.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapItemStoreFromApi(await itemStoreApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await itemStoreApi.update(
        row.ID,
        mapItemStoreToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update item store status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Store Name options (for searchable dropdown with write option)
  const storeNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.STORE_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((sn) => ({ value: sn, label: sn }))
  }, [rows])

  // 2. Store Code options (for searchable dropdown with write option)
  const storeCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.STORE_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((sc) => ({ value: sc, label: sc }))
  }, [rows])

  // Individual Search Options:
  // 1. Store Name with dropdown field with write option (searchable: true)
  // 2. Store Code with dropdown field with write option (searchable: true)
  // 3. Is Default with dropdown field
  // 4. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'STORE_NAME',
        label: 'Store Name',
        placeholder: '--Select/Write Store Name--',
        searchable: true,
        options: storeNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.STORE_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'STORE_CODE',
        label: 'Store Code',
        placeholder: '--Select/Write Store Code--',
        searchable: true,
        options: storeCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.STORE_CODE ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'IS_DEFAULT',
        label: 'Is Default?',
        placeholder: '--Select Default--',
        options: [
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' },
        ],
        matches: (row, value) => {
          if (value === '' || value == null) return true
          return String(row.IS_DEFAULT) === String(value)
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
    [storeNameOptions, storeCodeOptions],
  )

  return (
    <ListPage
      title={'Item Store'}
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

export default ItemStoreList

