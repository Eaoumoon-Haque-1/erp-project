/** @file Available received assets, employees, and issue conditions. */
import { reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetItems } from '../../asset-item-information/data/assetItemInformationStore'
import { listAssetReceives } from '../../asset-receive-register/data/assetReceiveRegisterStore'
import { listBulkAssetReceives } from '../../bulk-asset-receive-for-split/data/bulkAssetReceiveStore'

export const assetConditionOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
]

function toAssetOption(record, source) {
  return {
    value: `${source}:${record.ID}`,
    receiveId: record.ID,
    source,
    assetItemId: record.ITEM_NAME,
    assetItemName: record.ITEM_NAME_LABEL,
    assetNo: record.ASSET_NO,
    availableDate: record.GRN_DATE,
    label: `${record.ASSET_NO} - ${record.ITEM_NAME_LABEL}`,
  }
}

export function getAssetAssignReferences(existingAssignments = [], currentAssignmentId = '') {
  const assignedKeys = new Set(existingAssignments
    .filter((record) => (
      record.ID !== String(currentAssignmentId)
      && record.STATUS === '1'
      && !record.ACTUAL_RETURN_DATE
    ))
    .map((record) => record.ASSET_RECORD_ID))

  const receivedAssets = [
    ...listAssetReceives().filter((record) => record.STATUS === '1').map((record) => toAssetOption(record, 'RECEIVE')),
    ...listBulkAssetReceives().filter((record) => record.STATUS === '1').map((record) => toAssetOption(record, 'BULK')),
  ]

  // Keeps the frontend demonstrable before a receive record is entered.
  const fallbackAssets = receivedAssets.length === 0
    ? listAssetItems().filter((record) => record.STATUS === '1').map((record) => ({
        value: `DEMO:${record.ID}`,
        receiveId: '',
        source: 'DEMO',
        assetItemId: record.ID,
        assetItemName: record.ITEM_NAME,
        assetNo: `AST-DEMO-${String(record.ID).padStart(4, '0')}`,
        availableDate: '',
        label: `AST-DEMO-${String(record.ID).padStart(4, '0')} - ${record.ITEM_NAME}`,
      }))
    : []

  return {
    availableAssets: [...receivedAssets, ...fallbackAssets]
      .filter((option) => !assignedKeys.has(option.value)),
    employees: reportingOfficerOptions,
    conditions: assetConditionOptions,
  }
}
