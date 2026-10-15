/**
 * @file Backend-facing data contract and client validation for Leave Type Assign.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEAVE_TYPE_GROUP_TABLE = 'HR_LEAVE_TYPE_GROUP'

export const initialLeaveTypeAssignValues = {
  BG_ID: '',
  LEAVE_TYPE_ID: '',
  BU_ID: '',
  STATUS: '1',
}

export function validateLeaveTypeAssign(values, existingRecords = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    LEAVE_TYPE_ID: String(values.LEAVE_TYPE_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.LEAVE_TYPE_ID) {
    errors.LEAVE_TYPE_ID = 'Leave Type is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  } else if (existingRecords.some((record) =>
    String(record.leaveTypeId ?? record.LEAVE_TYPE_ID) === normalizedValues.LEAVE_TYPE_ID &&
    String(record.buId ?? record.BU_ID) === normalizedValues.BU_ID
  )) {
    errors.BU_ID = 'This Leave Type is already assigned to the selected Business Unit.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
