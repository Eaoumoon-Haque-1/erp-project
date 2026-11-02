/** @file Read-only Unit of Measure details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { assetUnitsOfMeasureApi } from '../api/assetUnitOfMeasureApi'

const basePath = '/procure-to-pay/procurement-settings/asset-unit-of-measure'

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
  title: 'Unit of Measure (UOM) View',
  param: 'assetUnitOfMeasureId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: assetUnitsOfMeasureApi.get,
  fields: [
    { label: 'Unit Name', key: 'unitName' },
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

function AssetUnitOfMeasureView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetUnitOfMeasureView
