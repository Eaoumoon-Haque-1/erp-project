/**
 * @file ASSET_CUSTODIAN and ASSET_CUSTODIAN_DTL defaults and validation rules.
 */
export const ASSET_CUSTODIAN_TABLE = 'ASSET_CUSTODIAN'
export const ASSET_CUSTODIAN_DETAIL_TABLE = 'ASSET_CUSTODIAN_DTL'

export const initialCustodianValues = {
  CUSTODIAN_NAME: '',
  STATUS: '1',
}

export const initialSubCustodianValues = {
  SUB_CUSTODIAN_NAME: '',
  STATUS: '1',
}

function normalizeName(value) {
  return String(value ?? '').trim()
}

export function validateCustodian(values, existingRecords = []) {
  const normalized = {
    CUSTODIAN_NAME: normalizeName(values.CUSTODIAN_NAME),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalized.CUSTODIAN_NAME) {
    errors.CUSTODIAN_NAME = 'Custodian Name is required.'
  } else if (normalized.CUSTODIAN_NAME.length < 2) {
    errors.CUSTODIAN_NAME = 'Custodian Name must be at least 2 characters.'
  } else if (normalized.CUSTODIAN_NAME.length > 100) {
    errors.CUSTODIAN_NAME = 'Custodian Name must not exceed 100 characters.'
  } else if (existingRecords.some((record) => (
    normalizeName(record.CUSTODIAN_NAME).toLowerCase()
      === normalized.CUSTODIAN_NAME.toLowerCase()
  ))) {
    errors.CUSTODIAN_NAME = 'This Custodian Name already exists.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validateSubCustodian(values, rows = [], custodianName = '') {
  const normalized = {
    SUB_CUSTODIAN_NAME: normalizeName(values.SUB_CUSTODIAN_NAME),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}
  const normalizedParentName = normalizeName(custodianName).toLowerCase()

  if (!normalized.SUB_CUSTODIAN_NAME) {
    errors.SUB_CUSTODIAN_NAME = 'Sub Custodian Name is required.'
  } else if (normalized.SUB_CUSTODIAN_NAME.length < 2) {
    errors.SUB_CUSTODIAN_NAME = 'Sub Custodian Name must be at least 2 characters.'
  } else if (normalized.SUB_CUSTODIAN_NAME.length > 100) {
    errors.SUB_CUSTODIAN_NAME = 'Sub Custodian Name must not exceed 100 characters.'
  } else if (
    normalizedParentName
    && normalized.SUB_CUSTODIAN_NAME.toLowerCase() === normalizedParentName
  ) {
    errors.SUB_CUSTODIAN_NAME = 'Sub Custodian Name cannot match the Custodian Name.'
  } else if (rows.some((row) => (
    normalizeName(row.SUB_CUSTODIAN_NAME).toLowerCase()
      === normalized.SUB_CUSTODIAN_NAME.toLowerCase()
  ))) {
    errors.SUB_CUSTODIAN_NAME = 'This Sub Custodian has already been added.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validateCustodianSubmission(values, rows, existingRecords = []) {
  const parentResult = validateCustodian(values, existingRecords)
  const errors = { ...parentResult.errors }

  if (!Array.isArray(rows) || rows.length === 0) {
    errors.SUB_CUSTODIANS = 'Add at least one Sub Custodian.'
  }

  return {
    values: parentResult.values,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
