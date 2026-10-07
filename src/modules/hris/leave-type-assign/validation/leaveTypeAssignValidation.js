/**
 * @file Backend-facing data contract and client validation for Leave Type Assign.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEAVE_TYPE_GROUP_TABLE = 'HR_LEAVE_TYPE_GROUP'

export const temporaryLeaveTypeAssignBusinessGroup = {
  ID: '1',
  GROUP_NAME: 'Demo Business Group',
}

export const temporarySelectedLeaveType = {
  ID: '1',
  TYPE_NAME: 'Annual Leave',
}

export const temporaryLeaveTypeAssignBusinessUnits = [
  {
    ID: '1',
    BG_ID: '1',
    BUSINESS_UNIT: 'Demo Business Unit',
  },
  {
    ID: '2',
    BG_ID: '1',
    BUSINESS_UNIT: 'Corporate Business Unit',
  },
]

export const temporaryLeaveTypeAssigns = [
  {
    ID: '1',
    BG_ID: '1',
    LEAVE_TYPE_ID: '1',
    BU_ID: '1',
    STATUS: '1',
  },
]

export const initialLeaveTypeAssignValues = {
  BG_ID: temporaryLeaveTypeAssignBusinessGroup.ID,
  LEAVE_TYPE_ID: temporarySelectedLeaveType.ID,
  BU_ID: '',
  STATUS: '1',
}

export function validateLeaveTypeAssign(values) {
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
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
