/**
 * @file Backend-facing data contract and client validation for HR Lookup Type.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LOOKUP_TYPE_TABLE = 'HR_LOOKUP_TYPE'

export const initialHrLookupTypeValues = {
  TYPE_NAME: '',
  CODE: '',
  STATUS: '1',
}

export function validateHrLookupType(
  values,
  existingTypeNames = [],
  existingCodes = [],
) {
  const normalizedValues = {
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    CODE: String(values.CODE ?? '').trim(),
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

  if (normalizedValues.CODE) {
    if (normalizedValues.CODE.length < 2) {
      errors.CODE = 'Code must be at least 2 characters.'
    } else if (normalizedValues.CODE.length > 10) {
      errors.CODE = 'Code must not exceed 10 characters.'
    } else if (existingCodes.some(
      (code) => String(code).trim().toLowerCase() === normalizedValues.CODE.toLowerCase(),
    )) {
      errors.CODE = 'Code must be unique.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
