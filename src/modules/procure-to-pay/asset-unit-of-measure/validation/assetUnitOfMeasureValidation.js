/** @file INV_UOM defaults and client-side validation rules. */
export const ASSET_UNIT_OF_MEASURE_TABLE = 'INV_UOM'

export function createInitialAssetUnitOfMeasureValues(businessGroup) {
  return {
    BG_ID: String(businessGroup?.id ?? ''),
    BU_ID: '',
    UNIT_NAME: '',
    SORT_ORDER: '',
    STATUS: '1',
  }
}

function text(value) {
  return String(value ?? '').trim()
}

export function validateAssetUnitOfMeasure(values, existingRecords = []) {
  const normalized = {
    BG_ID: text(values.BG_ID),
    BU_ID: text(values.BU_ID),
    UNIT_NAME: text(values.UNIT_NAME),
    SORT_ORDER: text(values.SORT_ORDER),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalized.UNIT_NAME) errors.UNIT_NAME = 'Unit Name is required.'
  else if (normalized.UNIT_NAME.length < 2) errors.UNIT_NAME = 'Unit Name must be at least 2 characters.'
  else if (normalized.UNIT_NAME.length > 50) errors.UNIT_NAME = 'Unit Name must not exceed 50 characters.'
  else if (existingRecords.some((record) => text(record.UNIT_NAME).toLowerCase() === normalized.UNIT_NAME.toLowerCase())) errors.UNIT_NAME = 'This Unit Name already exists.'

  if (normalized.SORT_ORDER && (!/^\d+$/.test(normalized.SORT_ORDER) || Number(normalized.SORT_ORDER) < 1)) {
    errors.SORT_ORDER = 'Sort Order must be a positive whole number.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
