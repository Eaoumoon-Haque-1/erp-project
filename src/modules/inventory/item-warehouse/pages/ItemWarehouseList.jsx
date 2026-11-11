/**
 * @file Item Warehouse List page.
 * Displays all item warehouses with individual search options, filters, and row actions.
 * Group Name and Business Unit are removed from display and fetched based on session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemWarehouseApi } from '../api/itemWarehouseApi'
import { mapItemWarehouseFromApi, mapItemWarehouseToApi } from '../data/itemWarehouseApiMapper'

const defaultListPath = '/procure-to-pay/procurement-settings/item-warehouse'

const columns = [
  {
    key: 'WAREHOUSE_CODE',
    label: 'Warehouse Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'WAREHOUSE_NAME',
    label: 'Warehouse Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'STORE_NAME',
    label: 'Store',
    render: (value) => <span className={'text-gray-700 font-medium'}>{value || '-'}</span>,
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

function ItemWarehouseList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item-warehouse'
    : defaultListPath
  const createPath = `${listPath}/create`

  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? '').trim()

  const [rows, setRows] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    Promise.all([
      itemWarehouseApi.list({ buId: sessionBuId, bgId: sessionBgId || undefined }),
      itemStoreApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
    ])
      .then(([warehouseData, storeData]) => {
        if (!active) return
        const storeMap = new Map(
          (storeData || []).map((s) => [String(s.id), s.storeName || s.storeCode || String(s.id)]),
        )
        setStores(storeData || [])
        setRows(
          Array.isArray(warehouseData)
            ? warehouseData.map((d) => mapItemWarehouseFromApi(d, new Map(), new Map(), storeMap))
            : [],
        )
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load item warehouses.'))
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
      await itemWarehouseApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete item warehouse.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapItemWarehouseFromApi(await itemWarehouseApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await itemWarehouseApi.update(
        row.ID,
        mapItemWarehouseToApi({ ...current, STATUS: nextStatus }),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update item warehouse status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Warehouse Name options
  const warehouseNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.WAREHOUSE_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((wn) => ({ value: wn, label: wn }))
  }, [rows])

  // 2. Warehouse Code options
  const warehouseCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.WAREHOUSE_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((wc) => ({ value: wc, label: wc }))
  }, [rows])

  // 3. Store filter options
  const storeFilterOptions = useMemo(() => {
    return (stores || []).map((s) => ({
      value: String(s.id),
      label: s.storeName ? `${s.storeName} (${s.storeCode})` : s.storeCode,
    }))
  }, [stores])

  // Individual Search Options:
  // 1. Warehouse Name with dropdown field with write option (searchable: true)
  // 2. Warehouse Code with dropdown field with write option (searchable: true)
  // 3. Store with dropdown field
  // 4. Is Default with dropdown field
  // 5. Status with dropdown field
  const filters = useMemo(
    () => [
      {
        key: 'WAREHOUSE_NAME',
        label: 'Warehouse Name',
        placeholder: '--Select/Write Warehouse Name--',
        searchable: true,
        options: warehouseNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.WAREHOUSE_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'WAREHOUSE_CODE',
        label: 'Warehouse Code',
        placeholder: '--Select/Write Warehouse Code--',
        searchable: true,
        options: warehouseCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.WAREHOUSE_CODE ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'STORE_ID',
        label: 'Store',
        placeholder: '--Select Store--',
        options: storeFilterOptions,
        matches: (row, value) => {
          if (!value) return true
          const rowStoreIds = String(row.STORE_ID || '')
            .split(',')
            .map((s) => s.trim())
          return rowStoreIds.includes(String(value).trim())
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
    [warehouseNameOptions, warehouseCodeOptions, storeFilterOptions],
  )

  return (
    <ListPage
      title={'Item Warehouse'}
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

export default ItemWarehouseList

