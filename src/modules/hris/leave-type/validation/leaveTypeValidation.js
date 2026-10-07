/**
 * @file Backend-facing data contract and client validation for Leave Type.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEAVE_TYPE_TABLE = 'HR_LEAVE_TYPE'

export const temporaryLeaveTypeBusinessGroup = {
  ID: '1',
  GROUP_NAME: 'Demo Business Group',
}

export const initialLeaveTypeValues = {
  BG_ID: temporaryLeaveTypeBusinessGroup.ID,
  TYPE_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '',
  STATUS: '1',
}

export function validateLeaveType(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.TYPE_NAME) {
    errors.TYPE_NAME = 'Type Name is required.'
  } else if (normalizedValues.TYPE_NAME.length < 2) {
    errors.TYPE_NAME = 'Type Name must be at least 2 characters.'
  } else if (normalizedValues.TYPE_NAME.length > 50) {
    errors.TYPE_NAME = 'Type Name must not exceed 50 characters.'
  }

  if (normalizedValues.SHORT_NAME && normalizedValues.SHORT_NAME.length < 2) {
    errors.SHORT_NAME = 'Short Name must be at least 2 characters.'
  } else if (normalizedValues.SHORT_NAME.length > 5) {
    errors.SHORT_NAME = 'Short Name must not exceed 5 characters.'
  }

  if (normalizedValues.SORT_ORDER) {
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizedValues.SORT_ORDER)) {
      errors.SORT_ORDER = 'Sort Order must be a valid number.'
    } else if (Number(normalizedValues.SORT_ORDER) <= 0) {
      errors.SORT_ORDER = 'Sort Order must be greater than 0.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
