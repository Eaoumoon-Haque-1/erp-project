/**
 * @file Backend-facing data contract and client validation for User Type.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const USER_TYPE_TABLE = 'HR_USER_TYPE'

export const createInitialUserTypeValues = () => ({
  TYPE_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '1',
  STATUS: '1',
})

export function validateUserType(values, existingTypeNames = [], existingShortNames = []) {
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
  } else if (existingTypeNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.TYPE_NAME.toLowerCase(),
  )) {
    errors.TYPE_NAME = 'Type Name must be unique.'
  }

  if (normalizedValues.SHORT_NAME) {
    if (normalizedValues.SHORT_NAME.length < 2) {
      errors.SHORT_NAME = 'Short Name must be at least 2 characters.'
    } else if (existingShortNames.some(
      (name) => String(name).trim().toLowerCase() === normalizedValues.SHORT_NAME.toLowerCase(),
    )) {
      errors.SHORT_NAME = 'Short Name must be unique.'
    }
  }

  if (!/^[1-9]\d*$/.test(normalizedValues.SORT_ORDER)) {
    errors.SORT_ORDER = 'Sort Order must be a positive whole number.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
