/**
 * @file Backend-facing data contract and client validation for User Type Group.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const USER_TYPE_GROUP_TABLE = 'HR_USER_TYPE_GROUP'

export const createInitialUserTypeGroupValues = (businessGroupId) => ({
  BG_ID: String(businessGroupId ?? ''),
  USER_TYPE_ID: '',
  STATUS: '1',
})

export const initialBusinessUnitAssignment = {
  BU_ID: '',
  STATUS: '1',
}

export function validateUserTypeGroup(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? ''),
    USER_TYPE_ID: String(values.USER_TYPE_ID ?? ''),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}
  if (!normalizedValues.BG_ID) errors.BG_ID = 'Group Name is required.'
  if (!normalizedValues.USER_TYPE_ID) errors.USER_TYPE_ID = 'Type Name is required.'

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validateBusinessUnitAssignment(values, existingAssignments = []) {
  const normalizedValues = {
    BU_ID: String(values.BU_ID ?? ''),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  } else if (existingAssignments.some((assignment) => String(assignment.BU_ID) === normalizedValues.BU_ID)) {
    errors.BU_ID = 'This Business Unit is already assigned.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
