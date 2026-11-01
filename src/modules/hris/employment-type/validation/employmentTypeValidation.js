/**
 * @file Backend-facing data contract and client validation for Employment Type.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYMENT_TYPE_TABLE = 'HR_EMPLOYMENT_TYPE'

export const initialEmploymentTypeValues = {
  TYPE_NAME: '',
  SHORT_NAME: '',
  IS_DEFAULT: '0',
  SORT_ORDER: '1',
  IS_DATE_FIELD_REQUIRED: '0',
  DATE_FIELD_LABEL: '',
  CATEGORY: '',
  STATUS: '1',
}

export function validateEmploymentType(values, existingRecords = []) {
  const normalizedValues = {
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? '').trim(),
    IS_DEFAULT: String(values.IS_DEFAULT) === '1' ? '1' : '0',
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    IS_DATE_FIELD_REQUIRED: String(values.IS_DATE_FIELD_REQUIRED) === '1' ? '1' : '0',
    DATE_FIELD_LABEL: String(values.DATE_FIELD_LABEL ?? '').trim(),
    CATEGORY: String(values.CATEGORY ?? '').trim(),
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

  if (!normalizedValues.CATEGORY) {
    errors.CATEGORY = 'Category is required.'
  } else if (!['ET', 'WS', 'PS', 'ES'].includes(normalizedValues.CATEGORY)) {
    errors.CATEGORY = 'Select a valid Category.'
  }

  if (normalizedValues.IS_DATE_FIELD_REQUIRED === '1') {
    if (!normalizedValues.DATE_FIELD_LABEL) {
      errors.DATE_FIELD_LABEL = 'Date Field Label is required.'
    } else if (normalizedValues.DATE_FIELD_LABEL.length > 100) {
      errors.DATE_FIELD_LABEL = 'Date Field Label must not exceed 100 characters.'
    }
  } else {
    normalizedValues.DATE_FIELD_LABEL = ''
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
