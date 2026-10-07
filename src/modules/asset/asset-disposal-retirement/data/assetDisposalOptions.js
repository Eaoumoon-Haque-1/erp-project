/** @file Eligible physical assets and disposal workflow references. */
import { reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetAssignments } from '../../asset-assign-employee/data/assetAssignEmployeeStore'
import { listAssetReceives } from '../../asset-receive-register/data/assetReceiveRegisterStore'
import { listAssetLookupValues } from '../../asset-lookup-value/data/assetLookupValueStore'
import { listBulkAssetReceives } from '../../bulk-asset-receive-for-split/data/bulkAssetReceiveStore'

const fallbackDisposalTypes = ['Sale', 'Scrap', 'Donation', 'Write-off', 'Lost', 'Retirement']
const fallbackReasons = ['Obsolete', 'Damaged', 'Beyond Repair', 'End of Useful Life', 'Lost', 'Replacement']

function configuredOptions(typeName, fallback) {
  const configured = listAssetLookupValues()
    .filter((record) => record.STATUS === '1' && record.TYPE_NAME.trim().toLowerCase() === typeName.toLowerCase())
    .sort((left, right) => Number(left.SORT_ORDER || 0) - Number(right.SORT_ORDER || 0))
    .map((record) => ({ value: record.ID, label: record.VALUE }))
  return configured.length > 0
    ? configured
    : fallback.map((label) => ({ value: label.toUpperCase().replace(/[\s-]+/g, '_'), label }))
}

function toAssetOption(record, source) {
  return {
    value: `${source}:${record.ID}`,
    label: `${record.ASSET_NO} - ${record.ITEM_NAME_LABEL}`,
    source,
    receiveId: record.ID,
    record,
  }
}

export const disposalStatusOptions = [
  { value: 'DRAFT', label: 'Draft' }, { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' }, { value: 'COMPLETED', label: 'Completed' },
]

export function getAssetDisposalReferences(existingRecords = [], currentRecord = null) {
  const blockedAssets = new Set(existingRecords
    .filter((record) => record.STATUS === '1' && record.ID !== currentRecord?.ID)
    .map((record) => record.ASSET_RECORD_ID))
  const assignedAssets = new Set(listAssetAssignments()
    .filter((record) => record.STATUS === '1' && !record.ACTUAL_RETURN_DATE)
    .map((record) => record.ASSET_RECORD_ID))

  const receives = [
    ...listAssetReceives().filter((record) => record.STATUS === '1' || (currentRecord?.ASSET_SOURCE === 'RECEIVE' && record.ID === currentRecord.ASSET_RECEIVE_ID)).map((record) => toAssetOption(record, 'RECEIVE')),
    ...listBulkAssetReceives().filter((record) => record.STATUS === '1' || (currentRecord?.ASSET_SOURCE === 'BULK' && record.ID === currentRecord.ASSET_RECEIVE_ID)).map((record) => toAssetOption(record, 'BULK')),
  ]

  return {
    eligibleAssets: receives.filter((option) => !blockedAssets.has(option.value) && !assignedAssets.has(option.value)),
    disposalTypes: configuredOptions('Disposal Type', fallbackDisposalTypes),
    reasons: configuredOptions('Disposal Reason', fallbackReasons),
    approvers: reportingOfficerOptions,
    statuses: disposalStatusOptions,
  }
}
