/** @file Read-only Asset Group details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { assetGroupsApi } from '../api/assetGroupApi'

const basePath = '/asset/asset-group'

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

async function loadAssetGroup(id) {
  const record = await assetGroupsApi.get(id)
  let assetOwnerName = record.assetOwnerName ?? ''

  if (!assetOwnerName && record.assetOwnerId) {
    try {
      const department = await departmentsApi.get(record.assetOwnerId)
      assetOwnerName = department.departmentName ?? ''
    } catch {
      assetOwnerName = ''
    }
  }

  return { ...record, assetOwnerName }
}

const viewConfig = {
  title: 'Asset Group View',
  param: 'assetGroupId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadAssetGroup,
  fields: [
    { label: 'Asset Group', key: 'assetGroup' },
    { label: 'Asset Owner', value: (record) => record.assetOwnerName || 'N/A' },
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

function AssetGroupView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default AssetGroupView
