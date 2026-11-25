/** @file API-backed Depreciation Category list page. */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { depreciationCategoriesApi } from '../api/depreciationCategoryApi'
import { mapDepreciationCategoryFromApi, mapDepreciationCategoryToApi } from '../data/depreciationCategoryApiMapper'
import { loadDepreciationCategoryReferences } from '../data/depreciationCategoryOptions'

const columns = [
  { key: 'DEPRI_CATEGORY', label: 'Asset Major Category' },
  { key: 'DEPRI_METHOD_NAME', label: 'Depreciation Method' },
  { key: 'ASSET_TYPE_NAME', label: 'Asset Type' },
  { key: 'DEPRI_LIFE', label: 'Life (Months)' },
  { key: 'DEPRI_PERCENTAGE', label: 'Depreciation (%)' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner' },
  {
    key: 'STATUS',
    label: 'Status',
    render: (value) => (
      <span
        className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm ${
          value === '1' ? 'bg-action-success' : 'bg-action-danger'
        }`}
      >
        {value === '1' ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

function DepreciationCategoryList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const [resolvedGroupId, setResolvedGroupId] = useState(sessionGroupId)
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
      loadDepreciationCategoryReferences(sessionBusinessUnitId, effectiveGroupId),
      depreciationCategoriesApi.list(sessionBusinessUnitId),
    ])
      .then(([references, records]) => {
        if (!active) return
        const mapped = (records || []).map((record) => mapDepreciationCategoryFromApi(record, references))
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
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Depreciation Categories.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, effectiveGroupId])

  // Depreciation Category options for searchable dropdown with write enable option
  const depriCategoryOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(rows.map((r) => String(r.DEPRI_CATEGORY ?? '').trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b))
    return distinct.map((name) => ({ value: name, label: name }))
  }, [rows])

  // Individual Search options:
  // 1. Depreciation Category with dropdown field including write enable option
  // 2. Status with dropdown field
  const filters = useMemo(() => [
    {
      key: 'DEPRI_CATEGORY',
      label: 'Search by Asset Major Category',
      placeholder: '--Select/Write Asset Major Category--',
      searchable: true,
      options: depriCategoryOptions,
      matches: (row, value) => {
        const q = String(value ?? '').trim().toLowerCase()
        if (!q) return true
        return String(row.DEPRI_CATEGORY ?? '').toLowerCase().includes(q)
      },
    },
    {
      key: 'STATUS',
      label: 'Search by Status',
      placeholder: '--Search by Status--',
      options: [
        { label: 'Active', value: '1' },
        { label: 'Inactive', value: '0' },
      ],
    },
  ], [depriCategoryOptions])

  const handleDelete = async (row) => {
    try {
      await depreciationCategoriesApi.remove(row.ID)
      setRows((current) => current.filter((item) => item.ID !== row.ID))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to delete Depreciation Category.'))
    }
  }

  const handleStatusChange = async (row) => {
    try {
      const updated = await depreciationCategoriesApi.update(row.ID, mapDepreciationCategoryToApi({
        ...row,
        STATUS: row.STATUS === '1' ? '0' : '1',
      }))
      setRows((current) => current.map((item) => (
        item.ID === row.ID ? { ...item, STATUS: String(updated.status ?? item.STATUS) } : item
      )))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to update Depreciation Category status.'))
    }
  }

  return (
    <ListPage
      title={'Depreciation Category List'}
      createLabel={'New'}
      createTo={'/asset/depreciation-category/create'}
      filters={filters}
      columns={columns}
      rows={rows}
      loading={loading}
      message={message}
      renderActions={(row) => (
        <ListRowActions
          row={row}
          onView={() => navigate(`/asset/depreciation-category/${row.ID}/view`)}
          onEdit={() => navigate(`/asset/depreciation-category/${row.ID}/edit`)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    />
  )
}

export default DepreciationCategoryList
