/** @file Read-only Asset Lookup Value details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../api/assetLookupValueApi'

const basePath = '/asset/asset-lookup-value'

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
  title: 'Asset Lookup Value View',
  param: 'assetLookupValueId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: async (id) => {
    const record = await assetLookupValuesApi.get(id)
    const types = await assetLookupTypesApi.list(record.buId)
    const type = types.find((item) => String(item.id) === String(record.typeId))
    return { ...record, typeName: type?.typeName }
  },
  fields: [
    { label: 'Lookup Type', key: 'typeName' },
    { label: 'Lookup Type Code', key: 'typeCode' },
    { label: 'Lookup Value', key: 'value' },
    { label: 'Lookup Value Code', key: 'valueCode' },
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

function AssetLookupValueView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetLookupValueView
