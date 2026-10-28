/**
 * @file Data contract and client validation for Asset Lookup Value.
 * Spreadsheet table: ASSET_LOOKUP_VALUE.
 */
export const ASSET_LOOKUP_VALUE_TABLE = 'ASSET_LOOKUP_VALUE'

export function createInitialAssetLookupValueValues(businessGroup) {
  return {
    BG_ID: String(businessGroup?.id ?? ''),
    TYPE_ID: '',
    TYPE_NAME: '',
    VALUE: '',
    VALUE_CODE: '',
    SORT_ORDER: '1',
    STATUS: '1',
  }
}

export function validateAssetLookupValue(values, existingRecords = [], typeOptions = []) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? ''),
    TYPE_ID: String(values.TYPE_ID ?? ''),
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    VALUE: String(values.VALUE ?? '').trim(),
    VALUE_CODE: String(values.VALUE_CODE ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.TYPE_ID) errors.TYPE_ID = 'Lookup Type is required.'

  if (!normalizedValues.VALUE) {
    errors.VALUE = 'Lookup Value is required.'
  } else if (normalizedValues.VALUE.length < 2) {
    errors.VALUE = 'Lookup Value must be at least 2 characters.'
  } else if (normalizedValues.VALUE.length > 20) {
    errors.VALUE = 'Lookup Value must not exceed 20 characters.'
  } else if (existingRecords.some((record) => (
    String(record.TYPE_ID) === normalizedValues.TYPE_ID
    && String(record.VALUE).trim().toLowerCase() === normalizedValues.VALUE.toLowerCase()
  ))) {
    errors.VALUE = 'This Lookup Value already exists for the selected Lookup Type.'
  }

  const selectedType = typeOptions.find((option) => option.value === normalizedValues.TYPE_ID)
  if (!normalizedValues.VALUE_CODE) errors.VALUE_CODE = 'Lookup Value Code is required. Select a Lookup Type to populate it.'
  else if (!selectedType || normalizedValues.VALUE_CODE !== String(selectedType.code ?? '').trim()) errors.VALUE_CODE = 'Lookup Value Code must match the selected Lookup Type Code.'

  if (!/^[1-9]\d*$/.test(normalizedValues.SORT_ORDER)) {
    errors.SORT_ORDER = 'Sort Order must be a positive whole number.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

