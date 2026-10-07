/**
 * @file Backend-facing data contract and client validation for Department Group.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DEPARTMENT_GROUP_TABLE = 'HR_DEPT_GROUP'

export const temporaryDepartmentGroupBusinessUnits = [
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

export function createInitialDepartmentGroupValues(groupId, departmentId) {
  return {
    BG_ID: String(groupId ?? ''),
    DEPT_ID: String(departmentId ?? ''),
    BU_ID: '',
    STATUS: '1',
  }
}

export function validateDepartmentGroup(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    DEPT_ID: String(values.DEPT_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.DEPT_ID) {
    errors.DEPT_ID = 'Department Name is required.'
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
