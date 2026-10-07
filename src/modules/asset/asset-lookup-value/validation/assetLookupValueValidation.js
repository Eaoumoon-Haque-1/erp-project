/**
 * @file Data contract and client validation for Asset Lookup Value.
 * Spreadsheet table: ASSET_LOOKUP_VALUE.
 */
export const ASSET_LOOKUP_VALUE_TABLE = 'ASSET_LOOKUP_VALUE'

export function createInitialAssetLookupValueValues(businessGroup) {
  return {
    BG_ID: String(businessGroup?.id ?? ''),
    GROUP_NAME: businessGroup?.name ?? '',
    TYPE_ID: '',
    TYPE_NAME: '',
    VALUE: '',
    SORT_ORDER: '',
    STATUS: '1',
  }
}

export function validateAssetLookupValue(values, existingRecords = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? ''),
    GROUP_NAME: String(values.GROUP_NAME ?? '').trim(),
    TYPE_ID: String(values.TYPE_ID ?? ''),
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    VALUE: String(values.VALUE ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.BG_ID) errors.BG_ID = 'Group Name is required.'
  if (!normalizedValues.TYPE_ID) errors.TYPE_ID = 'Type is required.'

  if (!normalizedValues.VALUE) {
    errors.VALUE = 'Value is required.'
  } else if (normalizedValues.VALUE.length < 2) {
    errors.VALUE = 'Value must be at least 2 characters.'
  } else if (normalizedValues.VALUE.length > 20) {
    errors.VALUE = 'Value must not exceed 20 characters.'
  } else if (existingRecords.some((record) => (
    String(record.TYPE_ID) === normalizedValues.TYPE_ID
    && String(record.VALUE).trim().toLowerCase() === normalizedValues.VALUE.toLowerCase()
  ))) {
    errors.VALUE = 'This Value already exists for the selected Type.'
  }

  if (normalizedValues.SORT_ORDER) {
    const sortOrder = Number(normalizedValues.SORT_ORDER)
    if (!Number.isFinite(sortOrder) || sortOrder <= 0) {
      errors.SORT_ORDER = 'Sort Order must be a number greater than 0.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

