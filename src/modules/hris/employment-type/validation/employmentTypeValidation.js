/**
 * @file Backend-facing data contract and client validation for Employment Type.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYMENT_TYPE_TABLE = 'HR_EMPLOYMENT_TYPE'

export const initialEmploymentTypeValues = {
  TYPE_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '1',
  STATUS: '1',
}

export function validateEmploymentType(values, existingRecords = []) {
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
  } else if (existingRecords.some((record) =>
    String(record.typeName ?? record.TYPE_NAME).trim().toLowerCase() === normalizedValues.TYPE_NAME.toLowerCase()
  )) {
    errors.TYPE_NAME = 'Type Name must be unique.'
  }

  if (normalizedValues.SHORT_NAME && normalizedValues.SHORT_NAME.length < 2) {
    errors.SHORT_NAME = 'Short Name must be at least 2 characters.'
  }

  const sortOrder = Number(normalizedValues.SORT_ORDER)
  if (!Number.isFinite(sortOrder) || sortOrder <= 0) {
    errors.SORT_ORDER = 'Sort Order must be a number greater than 0.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
