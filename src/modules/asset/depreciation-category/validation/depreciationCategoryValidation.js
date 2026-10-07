/**
 * @file Data contract and validation for Depreciation Category.
 * Spreadsheet table: ASSET_DEPRI_CATEGORY.
 */
export const DEPRECIATION_CATEGORY_TABLE = 'ASSET_DEPRI_CATEGORY'

export const initialDepreciationCategoryValues = {
  DEPRI_CATEGORY: '',
  DEPRI_METHOD: '',
  DEPRI_METHOD_NAME: '',
  ASSET_TYPE: '',
  ASSET_TYPE_NAME: '',
  DEPRI_LIFE: '',
  DEPRI_PERCENTAGE: '',
  ASSET_OWNER: '',
  ASSET_OWNER_NAME: '',
  STATUS: '1',
}

export function validateDepreciationCategory(values, existingRecords = []) {
  const normalizedValues = {
    DEPRI_CATEGORY: String(values.DEPRI_CATEGORY ?? '').trim(),
    DEPRI_METHOD: String(values.DEPRI_METHOD ?? ''),
    DEPRI_METHOD_NAME: String(values.DEPRI_METHOD_NAME ?? '').trim(),
    ASSET_TYPE: String(values.ASSET_TYPE ?? ''),
    ASSET_TYPE_NAME: String(values.ASSET_TYPE_NAME ?? '').trim(),
    DEPRI_LIFE: String(values.DEPRI_LIFE ?? '').trim(),
    DEPRI_PERCENTAGE: String(values.DEPRI_PERCENTAGE ?? '').trim(),
    ASSET_OWNER: String(values.ASSET_OWNER ?? ''),
    ASSET_OWNER_NAME: String(values.ASSET_OWNER_NAME ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.DEPRI_CATEGORY) {
    errors.DEPRI_CATEGORY = 'Depreciation Category is required.'
  }
  if (!normalizedValues.DEPRI_METHOD) {
    errors.DEPRI_METHOD = 'Depreciation Method is required.'
  }
  if (!normalizedValues.ASSET_TYPE) {
    errors.ASSET_TYPE = 'Asset Type is required.'
  }
  if (!normalizedValues.ASSET_OWNER) {
    errors.ASSET_OWNER = 'Asset Owner is required.'
  }

  if (!normalizedValues.DEPRI_LIFE) {
    errors.DEPRI_LIFE = 'Depreciation Life is required.'
  } else if (!/^\d+$/.test(normalizedValues.DEPRI_LIFE) || Number(normalizedValues.DEPRI_LIFE) < 1) {
    errors.DEPRI_LIFE = 'Depreciation Life must be a whole number of at least 1 month.'
  }

  if (!normalizedValues.DEPRI_PERCENTAGE) {
    errors.DEPRI_PERCENTAGE = 'Depreciation Percentage is required.'
  } else {
    const percentage = Number(normalizedValues.DEPRI_PERCENTAGE)
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      errors.DEPRI_PERCENTAGE = 'Depreciation Percentage must be greater than 0 and not exceed 100.'
    }
  }

  const duplicate = existingRecords.some((record) => (
    String(record.DEPRI_CATEGORY).trim().toLowerCase()
      === normalizedValues.DEPRI_CATEGORY.toLowerCase()
    && String(record.DEPRI_METHOD) === normalizedValues.DEPRI_METHOD
    && String(record.ASSET_TYPE) === normalizedValues.ASSET_TYPE
    && String(record.ASSET_OWNER) === normalizedValues.ASSET_OWNER
  ))
  if (duplicate) {
    errors.DEPRI_CATEGORY = 'This Category, Method, Asset Type, and Owner combination already exists.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

