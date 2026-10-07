/** @file ASSET_LOCATION defaults and workbook validation rules. */
export const ASSET_LOCATION_TABLE = 'ASSET_LOCATION'

export const initialLocationMasterValues = {
  CUSTODIAN_ID: '',
  CUSTODIAN_NAME: '',
  SUB_CUSTODIAN_ID: '',
  SUB_CUSTODIAN_NAME: '',
  LOCATION_NAME: '',
  LOCATION_CODE: '',
  ADDRESS: '',
  BUILDING: '',
  FLOOR: '',
  ROOM: '',
  STATUS: '1',
}

function text(value) {
  return String(value ?? '').trim()
}

export function validateLocationMaster(values, existingRecords = [], references = {}) {
  const normalized = {
    CUSTODIAN_ID: String(values.CUSTODIAN_ID ?? ''),
    CUSTODIAN_NAME: text(values.CUSTODIAN_NAME),
    SUB_CUSTODIAN_ID: String(values.SUB_CUSTODIAN_ID ?? ''),
    SUB_CUSTODIAN_NAME: text(values.SUB_CUSTODIAN_NAME),
    LOCATION_NAME: text(values.LOCATION_NAME),
    LOCATION_CODE: text(values.LOCATION_CODE),
    ADDRESS: text(values.ADDRESS),
    BUILDING: text(values.BUILDING),
    FLOOR: text(values.FLOOR),
    ROOM: text(values.ROOM),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}
  const { custodians = [] } = references
  const selectedCustodian = custodians.find(
    (record) => record.ID === normalized.CUSTODIAN_ID,
  )
  const validSubCustodian = selectedCustodian?.SUB_CUSTODIANS.some(
    (record) => record.ID === normalized.SUB_CUSTODIAN_ID && record.STATUS === '1',
  )

  if (!normalized.CUSTODIAN_ID) {
    errors.CUSTODIAN_ID = 'Custodian is required.'
  } else if (!selectedCustodian) {
    errors.CUSTODIAN_ID = 'Select a valid active Custodian.'
  }

  if (!normalized.SUB_CUSTODIAN_ID) {
    errors.SUB_CUSTODIAN_ID = 'Sub Custodian is required.'
  } else if (!validSubCustodian) {
    errors.SUB_CUSTODIAN_ID = 'Select a valid active Sub Custodian.'
  }

  if (!normalized.LOCATION_NAME) {
    errors.LOCATION_NAME = 'Location Name is required.'
  } else if (normalized.LOCATION_NAME.length < 2) {
    errors.LOCATION_NAME = 'Location Name must be at least 2 characters.'
  } else if (normalized.LOCATION_NAME.length > 100) {
    errors.LOCATION_NAME = 'Location Name must not exceed 100 characters.'
  } else if (existingRecords.some((record) => (
    String(record.CUSTODIAN_ID) === normalized.CUSTODIAN_ID
    && String(record.SUB_CUSTODIAN_ID) === normalized.SUB_CUSTODIAN_ID
    && text(record.LOCATION_NAME).toLowerCase() === normalized.LOCATION_NAME.toLowerCase()
  ))) {
    errors.LOCATION_NAME = 'This Location Name already exists for the selected Custodian and Sub Custodian.'
  }

  if (!normalized.LOCATION_CODE) {
    errors.LOCATION_CODE = 'Location Code is required.'
  } else if (normalized.LOCATION_CODE.length < 2) {
    errors.LOCATION_CODE = 'Location Code must be at least 2 characters.'
  } else if (normalized.LOCATION_CODE.length > 30) {
    errors.LOCATION_CODE = 'Location Code must not exceed 30 characters.'
  } else if (!/^[A-Za-z0-9_-]+$/.test(normalized.LOCATION_CODE)) {
    errors.LOCATION_CODE = 'Use only letters, numbers, hyphens, and underscores.'
  } else if (existingRecords.some((record) => (
    text(record.LOCATION_CODE).toLowerCase() === normalized.LOCATION_CODE.toLowerCase()
  ))) {
    errors.LOCATION_CODE = 'This Location Code already exists.'
  }

  if (!normalized.ADDRESS) {
    errors.ADDRESS = 'Address is required.'
  } else if (normalized.ADDRESS.length < 5) {
    errors.ADDRESS = 'Address must be at least 5 characters.'
  } else if (normalized.ADDRESS.length > 255) {
    errors.ADDRESS = 'Address must not exceed 255 characters.'
  }

  for (const [key, label] of [
    ['BUILDING', 'Building'],
    ['FLOOR', 'Floor'],
    ['ROOM', 'Room'],
  ]) {
    if (!normalized[key]) {
      errors[key] = `${label} is required.`
    } else if (normalized[key].length > 100) {
      errors[key] = `${label} must not exceed 100 characters.`
    }
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
