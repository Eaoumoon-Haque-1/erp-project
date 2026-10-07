/**
 * @file ASSET_ITEM form defaults and workbook validation rules.
 */
export const ASSET_ITEM_TABLE = 'ASSET_ITEM'

export const initialAssetItemInformationValues = {
  ITEM_NAME: '',
  ITEM_GROUP: '',
  ITEM_GROUP_NAME: '',
  ASSET_DEPRI_CATE_ID: '',
  DEPRI_CATEGORY_NAME: '',
  CATEGORY_TYPE: '',
  DEPRI_METHOD: '',
  DEPRI_LIFE: '',
  DEPRI_PERCENTAGE: '',
  UOM: '',
  UOM_NAME: '',
  ASSET_OWNER: '',
  STATUS: '1',
}

export function validateAssetItemInformation(
  values,
  existingRecords = [],
  references = {},
) {
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]),
  )
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'

  const errors = {}
  const { assetGroups = [], depreciationCategories = [], uomOptions = [] } = references

  if (!normalized.ITEM_NAME) {
    errors.ITEM_NAME = 'Item Name is required.'
  } else if (normalized.ITEM_NAME.length < 2) {
    errors.ITEM_NAME = 'Item Name must contain at least 2 characters.'
  } else if (normalized.ITEM_NAME.length > 100) {
    errors.ITEM_NAME = 'Item Name cannot exceed 100 characters.'
  }

  if (!normalized.ITEM_GROUP) {
    errors.ITEM_GROUP = 'Item Group is required.'
  } else if (!assetGroups.some((record) => record.ID === normalized.ITEM_GROUP)) {
    errors.ITEM_GROUP = 'Select a valid active Item Group.'
  }

  if (!normalized.ASSET_DEPRI_CATE_ID) {
    errors.ASSET_DEPRI_CATE_ID = 'Depreciation Category is required.'
  } else if (!depreciationCategories.some(
    (record) => record.ID === normalized.ASSET_DEPRI_CATE_ID,
  )) {
    errors.ASSET_DEPRI_CATE_ID = 'Select a valid active Depreciation Category.'
  }

  if (!normalized.CATEGORY_TYPE) errors.CATEGORY_TYPE = 'Category Type is required.'
  if (!normalized.DEPRI_METHOD) errors.DEPRI_METHOD = 'Depreciation Method is required.'

  if (!normalized.DEPRI_LIFE) {
    errors.DEPRI_LIFE = 'Depreciation Life is required.'
  } else if (!/^\d+$/.test(normalized.DEPRI_LIFE) || Number(normalized.DEPRI_LIFE) < 1) {
    errors.DEPRI_LIFE = 'Depreciation Life must be a whole number of at least 1 month.'
  }

  if (!normalized.DEPRI_PERCENTAGE) {
    errors.DEPRI_PERCENTAGE = 'Depreciation Percentage is required.'
  } else {
    const percentage = Number(normalized.DEPRI_PERCENTAGE)
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      errors.DEPRI_PERCENTAGE = 'Depreciation Percentage must be greater than 0 and not exceed 100.'
    }
  }

  if (!normalized.UOM) {
    errors.UOM = 'UOM is required.'
  } else if (!uomOptions.some((option) => option.value === normalized.UOM)) {
    errors.UOM = 'Select a valid active UOM.'
  }

  if (!normalized.ASSET_OWNER) errors.ASSET_OWNER = 'Asset Owner is required.'

  const duplicate = existingRecords.some((record) => (
    String(record.ITEM_GROUP) === normalized.ITEM_GROUP
    && String(record.ITEM_NAME).trim().toLowerCase() === normalized.ITEM_NAME.toLowerCase()
  ))
  if (duplicate) {
    errors.ITEM_NAME = 'This Item Name already exists in the selected Item Group.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
