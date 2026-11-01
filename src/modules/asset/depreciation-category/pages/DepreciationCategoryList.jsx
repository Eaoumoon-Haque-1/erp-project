/** @file API-backed Depreciation Category list page. */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { depreciationCategoriesApi } from '../api/depreciationCategoryApi'
import { mapDepreciationCategoryFromApi, mapDepreciationCategoryToApi } from '../data/depreciationCategoryApiMapper'
import { loadDepreciationCategoryReferences } from '../data/depreciationCategoryOptions'

const filters = [
  { key: 'DEPRI_CATEGORY', label: 'Search by Category', placeholder: '--Search by Category--', matches: (row, value) => row.DEPRI_CATEGORY.toLowerCase().includes(value.toLowerCase()) },
  { key: 'STATUS', label: 'Search by Status', placeholder: '--Search by Status--', options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
]
const columns = [
  { key: 'DEPRI_CATEGORY', label: 'Depreciation Category' },
  { key: 'DEPRI_METHOD_NAME', label: 'Depreciation Method' },
  { key: 'ASSET_TYPE_NAME', label: 'Asset Type' },
  { key: 'DEPRI_LIFE', label: 'Life (Months)' },
  { key: 'DEPRI_PERCENTAGE', label: 'Depreciation (%)' },
  { key: 'ASSET_OWNER_NAME', label: 'Asset Owner' },
  { key: 'STATUS', label: 'Status', render: (value) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white shadow-sm ${value === '1' ? 'bg-action-success' : 'bg-action-danger'}`}>{value === '1' ? 'Active' : 'Inactive'}</span> },
]

function DepreciationCategoryList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      loadDepreciationCategoryReferences(sessionBusinessUnitId, sessionGroupId),
      depreciationCategoriesApi.list(sessionBusinessUnitId),
    ])
      .then(([references, records]) => {
        if (active) setRows(records.map((record) => mapDepreciationCategoryFromApi(record, references)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Depreciation Categories.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

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
