/**
 * @file Backend-facing data contract and client validation for Employment Status.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const EMPLOYMENT_STATUS_TABLE = 'HR_EMPLOYMENT_STATUS'

export const initialEmploymentStatusValues = {
  BG_ID: '',
  BU_ID: '',
  STATUS_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '1',
  STATUS: '1',
}

export function validateEmploymentStatus(values, existingRecords = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    STATUS_NAME: String(values.STATUS_NAME ?? '').trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.STATUS_NAME) {
    errors.STATUS_NAME = 'Status Name is required.'
  } else if (normalizedValues.STATUS_NAME.length < 2) {
    errors.STATUS_NAME = 'Status Name must be at least 2 characters.'
  } else if (normalizedValues.STATUS_NAME.length > 50) {
    errors.STATUS_NAME = 'Status Name must not exceed 50 characters.'
  } else if (existingRecords.some((record) =>
    String(record.statusName ?? record.STATUS_NAME).trim().toLowerCase() === normalizedValues.STATUS_NAME.toLowerCase()
  )) {
    errors.STATUS_NAME = 'Status Name must be unique.'
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
