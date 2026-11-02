/** @file Read-only Asset Specification Mapping details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { assetItemsApi } from '../../asset-item-information/api/assetItemApi'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'

const basePath = '/asset/asset-specification-map'

function formatAuditDateTime(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  })
}

async function loadAssetSpecificationMap(id) {
  const record = await assetSpecificationMapsApi.get(id)
  if (record.itemName || !record.itemNameId) return record
  try {
    const item = await assetItemsApi.get(record.itemNameId)
    return { ...record, itemName: item.itemName }
  } catch {
    return record
  }
}

const viewConfig = {
  title: 'Asset Specification Mapping View',
  param: 'assetSpecificationMapId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadAssetSpecificationMap,
  fields: [
    { label: 'Asset Item Name', value: (record) => record.itemName || `Item ${record.itemNameId}` },
    { label: 'Specification', key: 'specName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
  auditFields: [
    { label: 'Created User ID', key: 'createdUserId' },
    { label: 'Created Employee ID', key: 'createdEmpId' },
    { label: 'Created At', value: (record) => formatAuditDateTime(record.createdDatetime) },
    { label: 'Created App', key: 'createdApp' },
    { label: 'Updated User ID', key: 'updatedUserId' },
    { label: 'Updated Employee ID', key: 'updatedEmpId' },
    { label: 'Updated At', value: (record) => formatAuditDateTime(record.updatedDatetime) },
    { label: 'Updated App', key: 'updatedApp' },
  ],
}

function AssetSpecificationMapView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetSpecificationMapView
