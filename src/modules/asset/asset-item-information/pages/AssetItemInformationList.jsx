/** @file API-backed Asset Item Information list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { assetItemsApi } from '../api/assetItemApi'
import { mapAssetItemFromApi, mapAssetItemToApi } from '../data/assetItemApiMapper'
import { loadAssetItemReferences } from '../data/assetItemInformationOptions'

const columns = [
  { key: 'ITEM_NAME', label: 'Item Name' },
  { key: 'ITEM_GROUP_NAME', label: 'Item Group', render: (value) => value || '-' },
  { key: 'ITEM_PIECE_OR_SET', label: 'Item Unit', render: (value) => value || 'Piece' },
  { key: 'DEPRI_CATEGORY_NAME', label: 'Asset Major Category' },
  { key: 'CATEGORY_TYPE', label: 'Asset Type', render: (value) => value || 'N/A' },
  { key: 'ASSET_OWNER', label: 'Asset Owner', render: (value) => value || 'N/A' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span className={[
        'inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm',
        value === '1' ? 'bg-action-success' : 'bg-action-danger',
      ].join(' ')}>
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function AssetItemInformationList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)
  const [references, setReferences] = useState({ assetGroups: [], depreciationCategories: [], uomOptions: [] })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Resolve BG_ID if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setResolvedGroupId(String(bu.bgId))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  const effectiveGroupId = resolvedGroupId || sessionGroupId

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      loadAssetItemReferences(sessionBusinessUnitId, effectiveGroupId),
      assetItemsApi.list(sessionBusinessUnitId),
    ])
      .then(([refs, records]) => {
        if (!active) return
        setReferences(refs)
        const mapped = (records || []).map((record) => mapAssetItemFromApi(record, refs))
        // Extra safeguard: exclude records belonging to other BUs/Groups
        const scoped = mapped.filter((record) => {
          const matchBu = sessionBusinessUnitId
            ? String(record.BU_ID) === sessionBusinessUnitId
            : true
          const matchBg = effectiveGroupId
            ? String(record.BG_ID) === String(effectiveGroupId)
            : true
          return matchBu && matchBg
        })
        setRows(scoped)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Items.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, effectiveGroupId])

  // 1. Item Name options for searchable dropdown with write enable option
  const itemNameOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.ITEM_NAME ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // 2. Item Group options for searchable dropdown with write enable option (scoped to user's BU & BG)
  const itemGroupOptions = useMemo(() => {
    const groupMap = new Map()
    ;(references.assetGroups || []).forEach((group) => {
      const name = String(group.ASSET_GROUP ?? '').trim()
      if (name && !groupMap.has(name.toLowerCase())) {
        groupMap.set(name.toLowerCase(), { value: name, label: name, code: group.ID })
      }
    })
    rows.forEach((row) => {
      const name = String(row.ITEM_GROUP_NAME ?? '').trim()
      if (name && name !== '-' && !groupMap.has(name.toLowerCase())) {
        groupMap.set(name.toLowerCase(), { value: name, label: name, code: row.ITEM_GROUP })
      }
    })
    return Array.from(groupMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [references.assetGroups, rows])

  // 3. Depreciation Category options for searchable dropdown with write enable option (scoped to user's BU & BG)
  const depriCategoryOptions = useMemo(() => {
    const catMap = new Map()
    ;(references.depreciationCategories || []).forEach((cat) => {
      const name = String(cat.DEPRI_CATEGORY ?? '').trim()
      if (name && !catMap.has(name.toLowerCase())) {
        catMap.set(name.toLowerCase(), { value: name, label: name, code: cat.ID })
      }
    })
    rows.forEach((row) => {
      const name = String(row.DEPRI_CATEGORY_NAME ?? '').trim()
      if (name && name !== '-' && !catMap.has(name.toLowerCase())) {
        catMap.set(name.toLowerCase(), { value: name, label: name, code: row.ASSET_DEPRI_CATE_ID })
      }
    })
    return Array.from(catMap.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [references.depreciationCategories, rows])

  // Individual Search options:
  // 1. Item Name with dropdown field including write enable option
  // 2. Item Group with dropdown field including write enable option
  // 3. Depreciation Category with dropdown field including write enable option
  // 4. Status with dropdown field
  const filters = useMemo(() => [
    {
      key: 'ITEM_NAME',
      label: 'Search by Item Name',
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
      key: 'ITEM_GROUP_NAME',
      label: 'Search by Item Group',
      placeholder: '--Select/Write Item Group--',
      searchable: true,
      options: itemGroupOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return (
          String(row.ITEM_GROUP_NAME ?? '').toLowerCase().includes(q) ||
          String(row.ITEM_GROUP ?? '').toLowerCase() === q
        )
      },
    },
    {
      key: 'DEPRI_CATEGORY_NAME',
      label: 'Search by Asset Major Category',
      placeholder: '--Select/Write Asset Major Category--',
      searchable: true,
      options: depriCategoryOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return (
          String(row.DEPRI_CATEGORY_NAME ?? '').toLowerCase().includes(q) ||
          String(row.ASSET_DEPRI_CATE_ID ?? '').toLowerCase() === q
        )
      },
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }],
    },
  ], [itemNameOptions, itemGroupOptions, depriCategoryOptions])

  const handleDelete = async (row) => {
    try {
      await assetItemsApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Asset Item.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await assetItemsApi.update(
        row.ID,
        mapAssetItemToApi(
          {
            ...row,
            STATUS: row.STATUS === '1' ? '0' : '1',
          },
          {},
          row.ITEM_SETS,
        ),
      )
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? { ...item, STATUS: String(updated.status ?? item.STATUS) } : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Asset Item status.'))
    }
  }

  return (
    <ListPage
      title={'Asset Item Information List'}
      createLabel={'New'}
      createTo={'/asset/asset-item-information/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/asset-item-information/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/asset-item-information/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default AssetItemInformationList
