/**
 * @file Item List page.
 * Displays all items with individual search options, filters, and row actions.
 * Group Name and Business Unit are retrieved from session data.
 */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { showError } from '../../../../components/shared/actionAlerts'
import { assetUnitsOfMeasureApi } from '../../../procure-to-pay/asset-unit-of-measure/api/assetUnitOfMeasureApi'
import { itemBrandApi } from '../../item-brand/api/itemBrandApi'
import { itemCategoryApi } from '../../item-category/api/itemCategoryApi'
import { itemStoreApi } from '../../item-store/api/itemStoreApi'
import { itemApi } from '../api/itemApi'
import { mapItemFromApi, mapItemToApi } from '../data/itemApiMapper'

const defaultListPath = '/procure-to-pay/procurement-settings/item'

const columns = [
  {
    key: 'ITEM_CODE',
    label: 'Item Code',
    render: (value) => (
      <span className={'font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded'}>
        {value || '-'}
      </span>
    ),
  },
  {
    key: 'ITEM_IMAGE',
    label: 'Picture',
    render: (value) =>
      value ? (
        <img
          src={value}
          alt={'Item'}
          className={'w-8 h-8 object-cover rounded border border-gray-200'}
        />
      ) : (
        <span className={'text-gray-300 text-xs'}>-</span>
      ),
  },
  {
    key: 'ITEM_NAME',
    label: 'Item Name',
    render: (value) => <span className={'font-bold text-gray-900'}>{value || '-'}</span>,
  },
  {
    key: 'CATEGORY_NAME',
    label: 'Category',
    render: (value) => <span className={'text-gray-700 font-medium'}>{value || '-'}</span>,
  },
  {
    key: 'BRAND_NAME',
    label: 'Brand',
    render: (value) => <span className={'text-gray-700'}>{value || '-'}</span>,
  },
  {
    key: 'UOM_NAME',
    label: 'UOM',
    render: (value) => <span className={'text-gray-700'}>{value || '-'}</span>,
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

function ItemList() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.startsWith('/inventory')
    ? '/inventory/item'
    : defaultListPath
  const createPath = `${listPath}/create`

  const { session } = useAuth()
  const sessionBuId = String(session?.buId ?? '').trim()
  const sessionBgId = String(session?.bgId ?? '').trim()

  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(Boolean(sessionBuId))

  useEffect(() => {
    if (!sessionBuId) return undefined
    let active = true

    Promise.all([
      itemApi.list({ buId: sessionBuId, bgId: sessionBgId || undefined }),
      itemCategoryApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
      itemBrandApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
      assetUnitsOfMeasureApi.list(sessionBuId).catch(() => []),
      itemStoreApi.list({ buId: sessionBuId, status: 1 }).catch(() => []),
    ])
      .then(([itemData, catData, brandData, uomData, storeData]) => {
        if (!active) return
        const catMap = new Map((catData || []).map((c) => [String(c.id), c.categoryName || '']))
        const brandMap = new Map((brandData || []).map((b) => [String(b.id), b.brandName || '']))
        const uomMap = new Map((uomData || []).map((u) => [String(u.id), u.unitName || '']))
        const storeMap = new Map((storeData || []).map((s) => [String(s.id), s.storeName || '']))

        setCategories(catData || [])
        setBrands(brandData || [])
        setRows(
          Array.isArray(itemData)
            ? itemData.map((d) =>
                mapItemFromApi(d, new Map(), new Map(), catMap, brandMap, uomMap, storeMap),
              )
            : [],
        )
      })
      .catch((err) => {
        if (!active) return
        showError(getApiErrorMessage(err, 'Unable to load items.'))
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
      await itemApi.remove(row.ID)
      setRows((items) => items.filter((item) => item.ID !== row.ID))
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete item.')
      showError(msg)
      throw new Error(msg, { cause: err })
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const current = mapItemFromApi(await itemApi.get(row.ID))
      const nextStatus = String(current.STATUS) === '1' ? '0' : '1'
      const updated = await itemApi.update(
        row.ID,
        mapItemToApi({ ...current, STATUS: nextStatus }, current.ATTRIBUTE_DETAILS || []),
      )
      setRows((items) =>
        items.map((item) =>
          item.ID === row.ID
            ? { ...item, STATUS: String(updated.status ?? nextStatus) }
            : item,
        ),
      )
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to update item status.')
      showError(msg)
      throw new Error(msg, { cause: error })
    }
  }

  // 1. Item Name options
  const itemNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.ITEM_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((n) => ({ value: n, label: n }))
  }, [rows])

  // 2. Item Code options
  const itemCodeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.ITEM_CODE ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((c) => ({ value: c, label: c }))
  }, [rows])

  // 3. Category options
  const categoryFilterOptions = useMemo(() => {
    return (categories || []).map((c) => ({
      value: String(c.id),
      label: c.categoryName || c.categoryCode,
    }))
  }, [categories])

  // 4. Brand options
  const brandFilterOptions = useMemo(() => {
    return (brands || []).map((b) => ({
      value: String(b.id),
      label: b.brandName || b.brandCode,
    }))
  }, [brands])

  const filters = useMemo(
    () => [
      {
        key: 'ITEM_NAME',
        label: 'Item Name',
        placeholder: '--Select/Write Item Name--',
        searchable: true,
        options: itemNameOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.ITEM_NAME ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'ITEM_CODE',
        label: 'Item Code',
        placeholder: '--Select/Write Item Code--',
        searchable: true,
        options: itemCodeOptions,
        matches: (row, value) => {
          const q = String(value ?? '').trim().toLowerCase()
          if (!q) return true
          return String(row.ITEM_CODE ?? '').toLowerCase().includes(q)
        },
      },
      {
        key: 'CATEGORY_ID',
        label: 'Category',
        placeholder: '--Select Category--',
        options: categoryFilterOptions,
        matches: (row, value) => {
          if (!value) return true
          return String(row.CATEGORY_ID) === String(value)
        },
      },
      {
        key: 'BRAND_ID',
        label: 'Brand',
        placeholder: '--Select Brand--',
        options: brandFilterOptions,
        matches: (row, value) => {
          if (!value) return true
          return String(row.BRAND_ID) === String(value)
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
    [itemNameOptions, itemCodeOptions, categoryFilterOptions, brandFilterOptions],
  )

  return (
    <ListPage
      title={'Item Information'}
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

export default ItemList

