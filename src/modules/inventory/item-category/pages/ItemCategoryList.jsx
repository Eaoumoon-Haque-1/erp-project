/**
 * @file Item Category List page.
 * Displays all item categories with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { itemCategoryApi } from '../api/itemCategoryApi'
import { mapItemCategoryFromApi, mapItemCategoryToApi } from '../data/itemCategoryApiMapper'

const defaultListPath = '/procure-to-pay/procurement-settings/item-category'

const columns = [
  {
    key: 'CATEGORY_CODE',
    label: 'Category Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'CATEGORY_NAME',
    label: 'Category Name',
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

function ItemCategoryList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-category'
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

    itemCategoryApi
      .list({ buId: sessionBuId, bgId: sessionBgId || undefined })
      .then((data) => {
        if (!active) return
        setRows(Array.isArray(data) ? data.map((d) => mapItemCategoryFromApi(d)) : [])
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load item categories.'))
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
      await itemCategoryApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete item category.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapItemCategoryFromApi(await itemCategoryApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await itemCategoryApi.update(
        row.ID,
        mapItemCategoryToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update item category status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Category Name options (for searchable dropdown with write option)
  const categoryNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.CATEGORY_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((cn) => ({ value: cn, label: cn }))
  }, [rows])

  // 2. Category Code options (for searchable dropdown with write option)
  const categoryCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.CATEGORY_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((cc) => ({ value: cc, label: cc }))
  }, [rows])

  // Individual Search Options:
  // 1. Category Name with dropdown field with write option (searchable: true)
  // 2. Category Code with dropdown field with write option (searchable: true)
  // 3. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'CATEGORY_NAME',
        label: 'Category Name',
        placeholder: '--Select/Write Category Name--',
        searchable: true,
        options: categoryNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.CATEGORY_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'CATEGORY_CODE',
        label: 'Category Code',
        placeholder: '--Select/Write Category Code--',
        searchable: true,
        options: categoryCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.CATEGORY_CODE ?? '').toLowerCase().includes(q)
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
    [categoryNameOptions, categoryCodeOptions],
  )

  return (
    <ListPage
      title={'Item Category'}
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

export default ItemCategoryList

