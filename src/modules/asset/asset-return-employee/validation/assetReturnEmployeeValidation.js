/** @file ASSET_ITEM_RETURN defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_ITEM_RETURN_TABLE = 'ASSET_ITEM_RETURN'

export function createInitialAssetReturnValues() {
  return {
    ASSET_ASSIGNMENT_ID: '', ASSET_RECORD_ID: '', ASSET_NO: '', ITEM_NAME: '', ITEM_NAME_LABEL: '',
    HR_EMPL_ID: '', EMPLOYEE_NAME: '', EMPLOYEE_ID: '', ASSET_DATE: '',
    ACTUAL_RETURN_DATE: formatIsoDate(new Date()), CONDITION_ON_RETURN: '', REMARKS: '', STATUS: '1',
  }
}

export function validateAssetReturn(values, existingRecords = [], references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]))
  delete normalized.EXPECTED_RETURN_DATE
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  const errors = {}
  const selectedAsset = references.assignedAssets?.find((option) => option.value === normalized.ASSET_ASSIGNMENT_ID)

  if (!normalized.ASSET_ASSIGNMENT_ID) errors.ASSET_ASSIGNMENT_ID = 'Asset Item Name and ID is required.'
  else if (!selectedAsset) errors.ASSET_ASSIGNMENT_ID = 'Select a valid currently assigned Asset.'

  if (!normalized.HR_EMPL_ID) errors.HR_EMPL_ID = 'Assign To Employee is required.'
  else if (!references.employees?.some((record) => record.value === normalized.HR_EMPL_ID)) errors.HR_EMPL_ID = 'The assigned Employee is not active.'
  else if (selectedAsset?.assignment.HR_EMPL_ID !== normalized.HR_EMPL_ID) errors.HR_EMPL_ID = 'The selected Employee is not the current assignee of this Asset.'

  const assignDate = parseIsoDate(normalized.ASSET_DATE)
  if (!assignDate) errors.ASSET_DATE = 'A valid Assign Date is unavailable for the selected Asset.'

  const actualDate = parseIsoDate(normalized.ACTUAL_RETURN_DATE)
  const today = parseIsoDate(formatIsoDate(new Date()))
  if (!normalized.ACTUAL_RETURN_DATE) errors.ACTUAL_RETURN_DATE = 'Actual Return Date is required.'
  else if (!actualDate) errors.ACTUAL_RETURN_DATE = 'Enter a valid Actual Return Date.'
  else if (assignDate && actualDate < assignDate) errors.ACTUAL_RETURN_DATE = 'Actual Return Date cannot be earlier than Assign Date.'
  else if (today && actualDate > today) errors.ACTUAL_RETURN_DATE = 'Actual Return Date cannot be in the future.'

  if (!normalized.CONDITION_ON_RETURN) errors.CONDITION_ON_RETURN = 'Condition on Return is required.'
  else if (!references.conditions?.some((option) => option.value === normalized.CONDITION_ON_RETURN)) errors.CONDITION_ON_RETURN = 'Select a valid Condition on Return.'

  const exceptionalCondition = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(normalized.CONDITION_ON_RETURN)
  if (exceptionalCondition && !normalized.REMARKS) errors.REMARKS = 'Remarks are required for the selected return condition.'
  else if (normalized.REMARKS.length > 500) errors.REMARKS = 'Remarks must not exceed 500 characters.'

  if (existingRecords.some((record) => record.ASSET_ASSIGNMENT_ID === normalized.ASSET_ASSIGNMENT_ID && record.STATUS === '1')) {
    errors.ASSET_ASSIGNMENT_ID = 'This assignment already has an active Asset Return.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
