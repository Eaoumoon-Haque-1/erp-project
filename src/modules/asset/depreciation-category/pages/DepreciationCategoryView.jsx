/** @file Read-only Depreciation Category details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { depreciationCategoriesApi } from '../api/depreciationCategoryApi'
import { mapDepreciationCategoryFromApi } from '../data/depreciationCategoryApiMapper'
import { loadDepreciationCategoryReferences } from '../data/depreciationCategoryOptions'

const basePath = '/asset/depreciation-category'

function formatAuditDateTime(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  })
}

async function loadDepreciationCategory(id) {
  const record = await depreciationCategoriesApi.get(id)
  const references = await loadDepreciationCategoryReferences(record.buId, record.bgId)
  return mapDepreciationCategoryFromApi(record, references)
}

const viewConfig = {
  title: 'Depreciation Category View',
  param: 'depreciationCategoryId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadDepreciationCategory,
  fields: [
    { label: 'Depreciation Category', key: 'DEPRI_CATEGORY' },
    { label: 'Depreciation Method', key: 'DEPRI_METHOD_NAME' },
    { label: 'Asset Type', key: 'ASSET_TYPE_NAME' },
    { label: 'Depreciation Life (Months)', key: 'DEPRI_LIFE' },
    { label: 'Depreciation Percentage', key: 'DEPRI_PERCENTAGE' },
    { label: 'Asset Owner', key: 'ASSET_OWNER_NAME' },
    { label: 'Status', key: 'STATUS', type: 'status' },
  ],
  auditFields: [
    { label: 'Created User ID', key: 'CREATED_BY' },
    { label: 'Created Employee ID', key: 'CREATED_EMP_ID' },
    { label: 'Created At', value: (record) => formatAuditDateTime(record.CREATED_AT) },
    { label: 'Created App', key: 'CREATED_APP' },
    { label: 'Updated User ID', key: 'UPDATED_BY' },
    { label: 'Updated Employee ID', key: 'UPDATED_EMP_ID' },
    { label: 'Updated At', value: (record) => formatAuditDateTime(record.UPDATED_AT) },
    { label: 'Updated App', key: 'UPDATED_APP' },
  ],
}

function DepreciationCategoryView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default DepreciationCategoryView
