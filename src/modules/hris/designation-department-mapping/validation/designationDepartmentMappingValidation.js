/**
 * @file Backend-facing data contract and client validation for Designation Department Mapping.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DESIGNATION_MAPPING_TABLE = 'HR_DEPT_DESIG_MAP'

export const initialDesignationDepartmentMappingValues = {
  BG_ID: '',
  BU_ID: '',
  DEPT_ID: '',
  DESIG_ID: '',
  STATUS: '1',
}

export function validateDesignationDepartmentMapping(values, existingMappings = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    DEPT_ID: String(values.DEPT_ID ?? '').trim(),
    DESIG_ID: String(values.DESIG_ID ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.DEPT_ID) {
    errors.DEPT_ID = 'Department Name is required.'
  }

  if (!normalizedValues.DESIG_ID) {
    errors.DESIG_ID = 'Designation Name is required.'
  } else if (existingMappings.some((mapping) =>
    String(mapping.buId ?? mapping.BU_ID) === normalizedValues.BU_ID &&
    String(mapping.deptId ?? mapping.DEPT_ID) === normalizedValues.DEPT_ID &&
    String(mapping.desigId ?? mapping.DESIG_ID) === normalizedValues.DESIG_ID
  )) {
    errors.DESIG_ID = 'This Department and Designation mapping already exists for the selected Business Unit.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
