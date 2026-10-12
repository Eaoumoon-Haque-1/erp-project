/**
 * @file Backend-facing data contract and client validation for HR Lookup Value.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LOOKUP_VALUE_TABLE = 'HR_LOOKUP_VALUE'

export const initialHrLookupValueValues = {
  BG_ID: '',
  TYPE_ID: '',
  VALUE: '',
  SORT_ORDER: '',
  STATUS: '1',
}

export function validateHrLookupValue(values) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    TYPE_ID: String(values.TYPE_ID ?? '').trim(),
    VALUE: String(values.VALUE ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Group Name is required.'
  }

  if (!normalizedValues.TYPE_ID) {
    errors.TYPE_ID = 'Type is required.'
  }

  if (!normalizedValues.VALUE) {
    errors.VALUE = 'Value is required.'
  } else if (normalizedValues.VALUE.length < 2) {
    errors.VALUE = 'Value must be at least 2 characters.'
  } else if (normalizedValues.VALUE.length > 20) {
    errors.VALUE = 'Value must not exceed 20 characters.'
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
