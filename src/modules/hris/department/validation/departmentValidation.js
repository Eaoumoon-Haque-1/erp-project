/**
 * @file Backend-facing data contract and client validation for Department.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DEPARTMENT_TABLE = 'HR_DEPT'

// Keep table values and form keys identical to the backend/spreadsheet
// contract. Visible labels can be friendlier without changing payload keys.

// Initial values define the complete controlled-form shape. Never leave a
// rendered input key undefined; create an initial value here instead.
export const initialDepartmentValues = {
  BG_ID: '',
  DEPARTMENT_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '',
  STATUS: '1',
}

// Validators normalize first and return { values, errors, isValid } so create
// and edit pages can use the same predictable submit flow.
export function validateDepartment(values, existingDepartments = []) {
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
  } else if (existingDepartments.some((department) =>
    String(department.bgId ?? department.BG_ID) === normalizedValues.BG_ID &&
    String(department.departmentName ?? department.DEPARTMENT_NAME).trim().toLowerCase() === normalizedValues.DEPARTMENT_NAME.toLowerCase()
  )) {
    errors.DEPARTMENT_NAME = 'Department Name must be unique within the selected Business Group.'
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
    const sortOrder = Number(normalizedValues.SORT_ORDER)
    if (!Number.isFinite(sortOrder)) {
      errors.SORT_ORDER = 'Sort Order must be a valid number.'
    } else if (sortOrder <= 0) {
      errors.SORT_ORDER = 'Sort Order must be greater than 0.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
