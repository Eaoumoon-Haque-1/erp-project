/** @file Read-only Asset Lookup Type details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { assetLookupTypesApi } from '../api/assetLookupTypeApi'

const basePath = '/asset/asset-lookup-type'

function formatAuditDateTime(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

const viewConfig = {
  title: 'Asset Lookup Type View',
  param: 'assetLookupTypeId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: assetLookupTypesApi.get,
  fields: [
    { label: 'Lookup Type Name', key: 'typeName' },
    { label: 'Lookup Type Code', key: 'typeCode' },
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

function AssetLookupTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetLookupTypeView
