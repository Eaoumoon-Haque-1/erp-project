/**
 * @file Backend-facing data contract and client validation for Designation.
 * Sections: exact table constant, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const DESIGNATION_TABLE = 'HR_DESIG'

export const initialDesignationValues = {
  BG_ID: '',
  DESIGNATION_NAME: '',
  SHORT_NAME: '',
  SORT_ORDER: '1',
  STATUS: '1',
}

export function validateDesignation(values, existingDesignations = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    DESIGNATION_NAME: values.DESIGNATION_NAME.trim(),
    SHORT_NAME: values.SHORT_NAME.trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.DESIGNATION_NAME) {
    errors.DESIGNATION_NAME = 'Designation Name is required.'
  } else if (normalizedValues.DESIGNATION_NAME.length < 2) {
    errors.DESIGNATION_NAME = 'Designation Name must be at least 2 characters.'
  } else if (normalizedValues.DESIGNATION_NAME.length > 50) {
    errors.DESIGNATION_NAME = 'Designation Name must not exceed 50 characters.'
  } else if (existingDesignations.some((designation) =>
    String(designation.bgId ?? designation.BG_ID) === normalizedValues.BG_ID &&
    String(designation.designationName ?? designation.DESIGNATION_NAME).trim().toLowerCase() === normalizedValues.DESIGNATION_NAME.toLowerCase()
  )) {
    errors.DESIGNATION_NAME = 'Designation Name must be unique within the selected Business Group.'
  }

  if (
    normalizedValues.SHORT_NAME &&
    normalizedValues.SHORT_NAME.length < 2
  ) {
    errors.SHORT_NAME = 'Short Name must be at least 2 characters.'
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
