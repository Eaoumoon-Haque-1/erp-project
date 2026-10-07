/**
 * @file Backend-facing data contract and client validation for Designation Department Mapping.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DESIGNATION_MAPPING_TABLE = 'HR_DEPT_DESIG_MAP'

export const temporaryMappingBusinessGroup = {
  ID: '1',
  GROUP_NAME: 'Demo Business Group',
}

export const temporaryMappingBusinessUnits = [
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

export const temporaryMappingDepartments = [
  {
    ID: '1',
    BU_ID: '1',
    DEPARTMENT_NAME: 'Human Resources',
  },
  {
    ID: '2',
    BU_ID: '1',
    DEPARTMENT_NAME: 'Finance',
  },
  {
    ID: '3',
    BU_ID: '2',
    DEPARTMENT_NAME: 'Administration',
  },
]

export const temporaryMappingDesignations = [
  {
    ID: '1',
    DEPT_ID: '1',
    DESIGNATION_NAME: 'HR Manager',
  },
  {
    ID: '2',
    DEPT_ID: '1',
    DESIGNATION_NAME: 'HR Officer',
  },
  {
    ID: '3',
    DEPT_ID: '2',
    DESIGNATION_NAME: 'Accounts Officer',
  },
  {
    ID: '4',
    DEPT_ID: '3',
    DESIGNATION_NAME: 'Administrative Officer',
  },
]

export const temporaryDesignationDepartmentMappings = [
  {
    ID: '1',
    BG_ID: '1',
    BU_ID: '1',
    DEPT_ID: '1',
    DESIG_ID: '1',
    STATUS: '1',
  },
]

export const initialDesignationDepartmentMappingValues = {
  BG_ID: temporaryMappingBusinessGroup.ID,
  BU_ID: '',
  DEPT_ID: '',
  DESIG_ID: '',
  STATUS: '1',
}

export function validateDesignationDepartmentMapping(values) {
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
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
