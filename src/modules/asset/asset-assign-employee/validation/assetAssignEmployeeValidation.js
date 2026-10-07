/** @file ASSET_ASSIGN_TO_EMPL defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_ASSIGN_TO_EMPLOYEE_TABLE = 'ASSET_ASSIGN_TO_EMPL'

export const initialAssetAssignmentValues = {
  ASSET_DATE: formatIsoDate(new Date()),
  EXPECTED_RETURN_DATE: '',
  ASSET_RECORD_ID: '',
  ASSET_RECEIVE_ID: '',
  ASSET_SOURCE: '',
  ASSET_NO: '',
  ASSET_AVAILABLE_DATE: '',
  ITEM_NAME: '',
  ITEM_NAME_LABEL: '',
  HR_EMPL_ID: '',
  EMPLOYEE_NAME: '',
  CONDITION_ON_ISSUE: '',
  REMARKS: '',
  ACTUAL_RETURN_DATE: '',
  STATUS: '1',
}

export function validateAssetAssignment(values, existingRecords = [], references = {}) {
  const normalized = {
    ...values,
    ASSET_DATE: String(values.ASSET_DATE ?? ''),
    EXPECTED_RETURN_DATE: String(values.EXPECTED_RETURN_DATE ?? ''),
    ASSET_RECORD_ID: String(values.ASSET_RECORD_ID ?? ''),
    ASSET_RECEIVE_ID: String(values.ASSET_RECEIVE_ID ?? ''),
    ASSET_SOURCE: String(values.ASSET_SOURCE ?? ''),
    ASSET_NO: String(values.ASSET_NO ?? '').trim(),
    ITEM_NAME: String(values.ITEM_NAME ?? ''),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    HR_EMPL_ID: String(values.HR_EMPL_ID ?? ''),
    EMPLOYEE_NAME: String(values.EMPLOYEE_NAME ?? '').trim(),
    CONDITION_ON_ISSUE: String(values.CONDITION_ON_ISSUE ?? ''),
    REMARKS: String(values.REMARKS ?? '').trim(),
    ACTUAL_RETURN_DATE: String(values.ACTUAL_RETURN_DATE ?? ''),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}
  const selectedAsset = references.availableAssets?.find(
    (option) => option.value === normalized.ASSET_RECORD_ID,
  )

  if (!normalized.ASSET_DATE) {
    errors.ASSET_DATE = 'Assign Date is required.'
  } else {
    const assignDate = parseIsoDate(normalized.ASSET_DATE)
    const availableDate = parseIsoDate(normalized.ASSET_AVAILABLE_DATE)
    if (!assignDate) errors.ASSET_DATE = 'Enter a valid Assign Date.'
    else if (availableDate && assignDate < availableDate) {
      errors.ASSET_DATE = 'Assign Date cannot be earlier than the asset availability date.'
    }
  }

  if (normalized.EXPECTED_RETURN_DATE) {
    const assignDate = parseIsoDate(normalized.ASSET_DATE)
    const expectedReturnDate = parseIsoDate(normalized.EXPECTED_RETURN_DATE)
    if (!expectedReturnDate) {
      errors.EXPECTED_RETURN_DATE = 'Enter a valid Expected Return Date.'
    } else if (assignDate && expectedReturnDate <= assignDate) {
      errors.EXPECTED_RETURN_DATE = 'Expected Return Date must be later than Assign Date.'
    }
  }

  if (!normalized.ASSET_RECORD_ID) {
    errors.ASSET_RECORD_ID = 'Asset Item Name and ID is required.'
  } else if (!selectedAsset) {
    errors.ASSET_RECORD_ID = 'Select a valid available Asset.'
  } else if (existingRecords.some((record) => (
    record.ASSET_RECORD_ID === normalized.ASSET_RECORD_ID
    && record.STATUS === '1'
    && !record.ACTUAL_RETURN_DATE
  ))) {
    errors.ASSET_RECORD_ID = 'This Asset is already assigned to an employee.'
  }

  if (!normalized.HR_EMPL_ID) {
    errors.HR_EMPL_ID = 'Assign To Employee is required.'
  } else if (!references.employees?.some((record) => record.value === normalized.HR_EMPL_ID)) {
    errors.HR_EMPL_ID = 'Select a valid active Employee.'
  }

  if (!normalized.CONDITION_ON_ISSUE) {
    errors.CONDITION_ON_ISSUE = 'Condition on Issue is required.'
  } else if (!references.conditions?.some((option) => option.value === normalized.CONDITION_ON_ISSUE)) {
    errors.CONDITION_ON_ISSUE = 'Select a valid Condition on Issue.'
  }

  if (normalized.CONDITION_ON_ISSUE === 'DAMAGED' && !normalized.REMARKS) {
    errors.REMARKS = 'Remarks are required when the asset condition is Damaged.'
  } else if (normalized.REMARKS.length > 500) {
    errors.REMARKS = 'Remarks must not exceed 500 characters.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
