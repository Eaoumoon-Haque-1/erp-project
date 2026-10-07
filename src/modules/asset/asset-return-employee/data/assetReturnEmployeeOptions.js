/** @file Currently assigned assets, active employees, and return conditions. */
import { reportingOfficerOptions } from '../../../hris/employee-information/data/employeeOptions'
import { listAssetAssignments } from '../../asset-assign-employee/data/assetAssignEmployeeStore'

export const assetReturnConditionOptions = [
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'LOST', label: 'Lost' },
  { value: 'BEYOND_REPAIR', label: 'Beyond Repair' },
]

export function getAssetReturnReferences(currentAssignmentId = '') {
  const assignedAssets = listAssetAssignments()
    .filter((record) => (
      record.STATUS === '1'
      && (!record.ACTUAL_RETURN_DATE || record.ID === String(currentAssignmentId))
    ))
    .map((record) => ({
      value: record.ID,
      label: `${record.ASSET_NO} - ${record.ITEM_NAME_LABEL}`,
      assignment: record,
    }))

  return {
    assignedAssets,
    employees: reportingOfficerOptions,
    conditions: assetReturnConditionOptions,
  }
}
