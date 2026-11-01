/** @file Read-only Asset Item Information details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { assetItemsApi } from '../api/assetItemApi'
import { mapAssetItemFromApi } from '../data/assetItemApiMapper'
import { loadAssetItemReferences } from '../data/assetItemInformationOptions'

const basePath = '/asset/asset-item-information'

async function loadAssetItem(id) {
  const record = await assetItemsApi.get(id)
  const references = await loadAssetItemReferences(record.buId, record.bgId)
  return mapAssetItemFromApi(record, references)
}

function formatAuditDateTime(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  })
}

const viewConfig = {
  title: 'Asset Item Information View',
  param: 'assetItemId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadAssetItem,
  fields: [
    { label: 'Item Name', key: 'ITEM_NAME' },
    { label: 'Item Group', key: 'ITEM_GROUP_NAME' },
    { label: 'Depreciation Category', key: 'DEPRI_CATEGORY_NAME' },
    { label: 'Depreciation Method', key: 'DEPRI_METHOD' },
    { label: 'Asset Type', key: 'CATEGORY_TYPE' },
    { label: 'Depreciation Life', key: 'DEPRI_LIFE' },
    { label: 'Depreciation Percentage', key: 'DEPRI_PERCENTAGE' },
    { label: 'UOM', key: 'UOM_NAME' },
    { label: 'Asset Owner', key: 'ASSET_OWNER' },
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

function AssetItemInformationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetItemInformationView
