/**
 * @file Backend-facing data contract and client validation for Department.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DEPARTMENT_TABLE = 'HR_DEPT'

// Keep table values and form keys identical to the backend/spreadsheet
// contract. Visible labels can be friendlier without changing payload keys.

export const temporaryDepartmentBusinessGroup = {
  ID: '1',
  GROUP_NAME: 'Demo Business Group',
}

// Initial values define the complete controlled-form shape. Never leave a
// rendered input key undefined; create an initial value here instead.
export const initialDepartmentValues = {
  BG_ID: temporaryDepartmentBusinessGroup.ID,
  DEPARTMENT_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '',
  STATUS: '1',
}

// Temporary records/options stand in for API results during frontend work.
// Keep the shape close to the future response so components need fewer changes.
export const temporaryDepartments = [
  {
    ID: '1',
    BG_ID: temporaryDepartmentBusinessGroup.ID,
    DEPARTMENT_NAME: 'Human Resources',
    SHORT_NAME: 'HR',
    SORT_ORDER: '1',
    STATUS: '1',
  },
]

// Validators normalize first and return { values, errors, isValid } so create
// and edit pages can use the same predictable submit flow.
export function validateDepartment(values) {
  // Normalize once before applying rules or building the eventual payload.
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    DEPARTMENT_NAME: values.DEPARTMENT_NAME.trim(),
    SHORT_NAME: values.SHORT_NAME.trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  // Error keys must exactly match input names so the form can display and
  // clear each message independently.
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.DEPARTMENT_NAME) {
    errors.DEPARTMENT_NAME = 'Department Name is required.'
  } else if (normalizedValues.DEPARTMENT_NAME.length < 2) {
    errors.DEPARTMENT_NAME = 'Department Name must be at least 2 characters.'
  } else if (normalizedValues.DEPARTMENT_NAME.length > 100) {
    errors.DEPARTMENT_NAME = 'Department Name must not exceed 100 characters.'
  }

  if (
    normalizedValues.SHORT_NAME &&
    normalizedValues.SHORT_NAME.length < 2
  ) {
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
