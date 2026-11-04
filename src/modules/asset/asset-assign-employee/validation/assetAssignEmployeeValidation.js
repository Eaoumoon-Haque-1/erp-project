/** @file ASSET_ASSIGN_TO_EMPL defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat'

export const ASSET_ASSIGN_TO_EMPLOYEE_TABLE = 'ASSET_ASSIGN_TO_EMPL'

export const initialAssetAssignmentValues = {
  ASSET_DATE: formatIsoDate(new Date()),
  ITEM_ID: '',
  ITEM_NAME_LABEL: '',
  HR_EMPL_ID: '',
  EMPLOYEE_NAME: '',
  CONDITION_ON_ISSUE: '',
  EXPECTED_RETURN_DATE: '',
  ACTUAL_RETURN_DATE: '',
  REMARKS: '',
  STATUS: '1',
}

export function validateAssetAssignment(values, references = {}) {
  const normalized = {
    ...values,
    ASSET_DATE: String(values.ASSET_DATE ?? ''),
    ITEM_ID: String(values.ITEM_ID ?? ''),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    HR_EMPL_ID: String(values.HR_EMPL_ID ?? ''),
    EMPLOYEE_NAME: String(values.EMPLOYEE_NAME ?? '').trim(),
    CONDITION_ON_ISSUE: String(values.CONDITION_ON_ISSUE ?? ''),
    EXPECTED_RETURN_DATE: String(values.EXPECTED_RETURN_DATE ?? ''),
    ACTUAL_RETURN_DATE: String(values.ACTUAL_RETURN_DATE ?? ''),
    REMARKS: String(values.REMARKS ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }

  const errors = {}

  if (!normalized.ASSET_DATE) {
    errors.ASSET_DATE = 'Assign Date is required.'
  } else {
    const assignDate = parseIsoDate(normalized.ASSET_DATE)
    if (!assignDate) errors.ASSET_DATE = 'Enter a valid Assign Date.'
  }

  if (!normalized.ITEM_ID) {
    errors.ITEM_ID = 'Asset Item is required.'
  } else if (
    references.assetItems?.length > 0
    && !references.assetItems.some((item) => String(item.id ?? item.ID) === normalized.ITEM_ID)
  ) {
    errors.ITEM_ID = 'Select a valid active Asset Item.'
  }

  if (!normalized.HR_EMPL_ID) {
    errors.HR_EMPL_ID = 'Assign To Employee is required.'
  } else if (
    references.employees?.length > 0
    && !references.employees.some((record) => String(record.id ?? record.ID ?? record.value) === normalized.HR_EMPL_ID)
  ) {
    errors.HR_EMPL_ID = 'Select a valid active Employee.'
  }

  if (!normalized.CONDITION_ON_ISSUE) {
    errors.CONDITION_ON_ISSUE = 'Condition on Issue is required.'
  } else if (
    references.conditions?.length > 0
    && !references.conditions.some((option) => option.value === normalized.CONDITION_ON_ISSUE)
  ) {
    errors.CONDITION_ON_ISSUE = 'Select a valid Condition on Issue.'
  }

  if (normalized.EXPECTED_RETURN_DATE) {
    const expDate = parseIsoDate(normalized.EXPECTED_RETURN_DATE)
    const assignDate = parseIsoDate(normalized.ASSET_DATE)
    if (!expDate) {
      errors.EXPECTED_RETURN_DATE = 'Enter a valid Expected Return Date.'
    } else if (assignDate && expDate < assignDate) {
      errors.EXPECTED_RETURN_DATE = 'Expected Return Date cannot be earlier than Assign Date.'
    }
  }

  if (normalized.CONDITION_ON_ISSUE === 'DAMAGED' && !normalized.REMARKS) {
    errors.REMARKS = 'Remarks are required when the asset condition is Damaged.'
  } else if (normalized.REMARKS.length > 500) {
    errors.REMARKS = 'Remarks must not exceed 500 characters.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
