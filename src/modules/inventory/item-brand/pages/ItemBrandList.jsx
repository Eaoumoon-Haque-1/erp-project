/**
 * @file Item Brand List page.
 * Displays all item brands with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { itemBrandApi } from '../api/itemBrandApi'
import { mapItemBrandFromApi, mapItemBrandToApi } from '../data/itemBrandApiMapper'

const defaultListPath = '/procure-to-pay/procurement-settings/item-brand'

const columns = [
  {
    key: 'BRAND_CODE',
    label: 'Brand Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'BRAND_NAME',
    label: 'Brand Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
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

function ItemBrandList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-brand'
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

    itemBrandApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapItemBrandFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load item brands.'))
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
      await itemBrandApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete item brand.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapItemBrandFromApi(await itemBrandApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await itemBrandApi.update(
        row.ID,
        mapItemBrandToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update item brand status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Brand Name options (for searchable dropdown with write option)
  const brandNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.BRAND_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((bn) => ({ value: bn, label: bn }))
  }, [rows])

  // 2. Brand Code options (for searchable dropdown with write option)
  const brandCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.BRAND_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((bc) => ({ value: bc, label: bc }))
  }, [rows])

  // Individual Search Options:
  // 1. Brand Name with dropdown field with write option (searchable: true)
  // 2. Brand Code with dropdown field with write option (searchable: true)
  // 3. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'BRAND_NAME',
        label: 'Brand Name',
        placeholder: '--Select/Write Brand Name--',
        searchable: true,
        options: brandNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.BRAND_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'BRAND_CODE',
        label: 'Brand Code',
        placeholder: '--Select/Write Brand Code--',
        searchable: true,
        options: brandCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.BRAND_CODE ?? '').toLowerCase().includes(q)
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
    [brandNameOptions, brandCodeOptions],
  )

  return (
    <ListPage
      title={'Item Brand'}
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

export default ItemBrandList

