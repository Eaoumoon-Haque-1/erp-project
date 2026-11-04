/** @file ASSET_ITEM_RETURN defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat'

export const ASSET_ITEM_RETURN_TABLE = 'ASSET_ITEM_RETURN'

export function createInitialAssetReturnValues() {
  return {
    ASSET_ASSIGNMENT_ID: '',
    ITEM_ID: '',
    ITEM_NAME_LABEL: '',
    HR_EMPL_ID: '',
    EMPLOYEE_NAME: '',
    EMPLOYEE_ID: '',
    ASSET_DATE: '',
    EXPECTED_RETURN_DATE: '',
    ACTUAL_RETURN_DATE: formatIsoDate(new Date()),
    CONDITION_ON_RETURN: '',
    REMARKS: '',
    STATUS: '1',
  }
}

export function validateAssetReturn(values, references = {}) {
  const normalized = {
    ...values,
    ASSET_ASSIGNMENT_ID: String(values.ASSET_ASSIGNMENT_ID ?? '').trim(),
    ITEM_ID: String(values.ITEM_ID ?? '').trim(),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    HR_EMPL_ID: String(values.HR_EMPL_ID ?? '').trim(),
    EMPLOYEE_NAME: String(values.EMPLOYEE_NAME ?? '').trim(),
    EMPLOYEE_ID: String(values.EMPLOYEE_ID ?? '').trim(),
    ASSET_DATE: String(values.ASSET_DATE ?? '').trim(),
    EXPECTED_RETURN_DATE: String(values.EXPECTED_RETURN_DATE ?? '').trim(),
    ACTUAL_RETURN_DATE: String(values.ACTUAL_RETURN_DATE ?? '').trim(),
    CONDITION_ON_RETURN: String(values.CONDITION_ON_RETURN ?? '').trim(),
    REMARKS: String(values.REMARKS ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }

  const errors = {}
  const selectedAsset = references.assignedAssets?.find(
    (option) => String(option.value) === normalized.ASSET_ASSIGNMENT_ID,
  )

  if (!normalized.ASSET_ASSIGNMENT_ID) {
    errors.ASSET_ASSIGNMENT_ID = 'Assigned Asset is required.'
  } else if (references.assignedAssets?.length > 0 && !selectedAsset) {
    errors.ASSET_ASSIGNMENT_ID = 'Select a valid currently assigned Asset.'
  }

  if (!normalized.HR_EMPL_ID) {
    errors.HR_EMPL_ID = 'Assigned Employee is required.'
  }

  const assignDate = parseIsoDate(normalized.ASSET_DATE)
  if (!assignDate) {
    errors.ASSET_DATE = 'A valid Assign Date is unavailable for the selected Asset.'
  }

  const actualDate = parseIsoDate(normalized.ACTUAL_RETURN_DATE)
  const today = parseIsoDate(formatIsoDate(new Date()))

  if (!normalized.ACTUAL_RETURN_DATE) {
    errors.ACTUAL_RETURN_DATE = 'Actual Return Date is required.'
  } else if (!actualDate) {
    errors.ACTUAL_RETURN_DATE = 'Enter a valid Actual Return Date.'
  } else if (assignDate && actualDate < assignDate) {
    errors.ACTUAL_RETURN_DATE = 'Actual Return Date cannot be earlier than Assign Date.'
  } else if (today && actualDate > today) {
    errors.ACTUAL_RETURN_DATE = 'Actual Return Date cannot be in the future.'
  }

  if (!normalized.CONDITION_ON_RETURN) {
    errors.CONDITION_ON_RETURN = 'Condition on Return is required.'
  } else if (
    references.conditions?.length > 0
    && !references.conditions.some((option) => option.value === normalized.CONDITION_ON_RETURN)
  ) {
    errors.CONDITION_ON_RETURN = 'Select a valid Condition on Return.'
  }

  const exceptionalCondition = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(normalized.CONDITION_ON_RETURN)
  if (exceptionalCondition && !normalized.REMARKS) {
    errors.REMARKS = 'Remarks are required for the selected return condition.'
  } else if (normalized.REMARKS.length > 500) {
    errors.REMARKS = 'Remarks must not exceed 500 characters.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
