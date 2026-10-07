/**
 * @file Backend-facing data contract and client validation for Employment Type.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYMENT_TYPE_TABLE = 'HR_EMPLOYMENT_TYPE'

export const initialEmploymentTypeValues = {
  TYPE_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '',
  STATUS: '1',
}

export function validateEmploymentType(values) {
  const normalizedValues = {
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

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
