/**
 * @file Backend-facing data contract and client validation for Designation Group.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DESIGNATION_GROUP_TABLE = 'HR_DESIG_GROUP'

export const temporaryDesignationGroupBusinessUnits = [
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

export function createInitialDesignationGroupValues(groupId, designationId) {
  return {
    BG_ID: String(groupId ?? ''),
    DESIG_ID: String(designationId ?? ''),
    BU_ID: '',
    STATUS: '1',
  }
}

export function validateDesignationGroup(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    DESIG_ID: String(values.DESIG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.DESIG_ID) {
    errors.DESIG_ID = 'Designation Name is required.'
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
