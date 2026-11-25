/**
 * @file ASSET_ITEM and ASSET_ITEM_SET form defaults and validation rules.
 */
export const ASSET_ITEM_TABLE = 'ASSET_ITEM'
export const ASSET_ITEM_SET_TABLE = 'ASSET_ITEM_SET'

export function createInitialAssetItemSetRow(overrides = {}, index = 1) {
  return {
    _ROW_ID:
      overrides._ROW_ID ||
      `item-set-row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ID: overrides.ID != null ? String(overrides.ID) : '',
    BG_ID: overrides.BG_ID != null ? String(overrides.BG_ID) : '',
    BU_ID: overrides.BU_ID != null ? String(overrides.BU_ID) : '',
    ITEM_ID: overrides.ITEM_ID != null ? String(overrides.ITEM_ID) : '',
    ITEM_NAME: overrides.ITEM_NAME != null ? String(overrides.ITEM_NAME) : '',
    ITEM_DETAILS:
      overrides.ITEM_DETAILS != null ? String(overrides.ITEM_DETAILS) : '',
    SORT_ORDER:
      overrides.SORT_ORDER != null && String(overrides.SORT_ORDER) !== ''
        ? String(overrides.SORT_ORDER)
        : String(index),
    STATUS: String(overrides.STATUS ?? '1') === '0' ? '0' : '1',
    CREATED_USER_ID:
      overrides.CREATED_USER_ID != null ? String(overrides.CREATED_USER_ID) : '',
    CREATED_EMP_ID:
      overrides.CREATED_EMP_ID != null ? String(overrides.CREATED_EMP_ID) : '',
    CREATED_DATETIME: overrides.CREATED_DATETIME ?? '',
    UPDATED_USER_ID:
      overrides.UPDATED_USER_ID != null ? String(overrides.UPDATED_USER_ID) : '',
    UPDATED_EMP_ID:
      overrides.UPDATED_EMP_ID != null ? String(overrides.UPDATED_EMP_ID) : '',
    UPDATED_DATETIME: overrides.UPDATED_DATETIME ?? '',
    CREATED_APP: overrides.CREATED_APP ?? '',
    UPDATED_APP: overrides.UPDATED_APP ?? '',
  }
}

export const initialAssetItemInformationValues = {
  BG_ID: '',
  BU_ID: '',
  ITEM_NAME: '',
  ITEM_GROUP: '',
  ITEM_GROUP_NAME: '',
  ITEM_PIECE_OR_SET: 'Piece',
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
  setRows = [],
) {
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]),
  )
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  normalized.ITEM_PIECE_OR_SET =
    normalized.ITEM_PIECE_OR_SET === 'Set' ? 'Set' : 'Piece'

  const errors = {}
  const { assetGroups = [], depreciationCategories = [] } = references

  if (!normalized.ITEM_NAME) {
    errors.ITEM_NAME = 'Item Name is required.'
  } else if (normalized.ITEM_NAME.length < 2) {
    errors.ITEM_NAME = 'Item Name must contain at least 2 characters.'
  } else if (normalized.ITEM_NAME.length > 100) {
    errors.ITEM_NAME = 'Item Name cannot exceed 100 characters.'
  }

  if (normalized.ITEM_GROUP && !assetGroups.some((record) => record.ID === normalized.ITEM_GROUP)) {
    errors.ITEM_GROUP = 'Select a valid active Item Group.'
  }

  if (!['Piece', 'Set'].includes(normalized.ITEM_PIECE_OR_SET)) {
    errors.ITEM_PIECE_OR_SET = 'Please select Piece or Set.'
  }

  if (!normalized.ASSET_DEPRI_CATE_ID) {
    errors.ASSET_DEPRI_CATE_ID = 'Asset Major Category is required.'
  } else if (!depreciationCategories.some(
    (record) => record.ID === normalized.ASSET_DEPRI_CATE_ID,
  )) {
    errors.ASSET_DEPRI_CATE_ID = 'Select a valid active Asset Major Category.'
  }

  if (!normalized.CATEGORY_TYPE) errors.CATEGORY_TYPE = 'Asset Type is required.'
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

  if (!normalized.ASSET_OWNER) errors.ASSET_OWNER = 'Asset Owner is required.'

  const duplicate = existingRecords.some((record) => (
    String(record.ITEM_GROUP || '') === String(normalized.ITEM_GROUP || '')
    && String(record.ITEM_NAME).trim().toLowerCase() === normalized.ITEM_NAME.toLowerCase()
  ))
  if (duplicate) {
    errors.ITEM_NAME = normalized.ITEM_GROUP
      ? 'This Item Name already exists in the selected Item Group.'
      : 'This Item Name already exists.'
  }

  const normalizedSetRows = Array.isArray(setRows)
    ? setRows.map((row, index) =>
        createInitialAssetItemSetRow(
          {
            ...row,
            ITEM_NAME: String(row.ITEM_NAME ?? '').trim(),
            ITEM_DETAILS: String(row.ITEM_DETAILS ?? '').trim(),
            SORT_ORDER: String(index + 1),
            STATUS: String(row.STATUS ?? '1') === '0' ? '0' : '1',
          },
          index + 1,
        ),
      )
    : []

  if (normalized.ITEM_PIECE_OR_SET === 'Set') {
    if (normalizedSetRows.length === 0) {
      errors.ITEM_SETS = 'Please add at least one item row for this Set.'
    } else {
      const seenNames = new Set()
      normalizedSetRows.forEach((row, index) => {
        if (!row.ITEM_NAME) {
          errors[`setRow_${index}_ITEM_NAME`] = 'Item Name is required.'
        } else if (row.ITEM_NAME.length < 2) {
          errors[`setRow_${index}_ITEM_NAME`] = 'Item Name must be at least 2 characters.'
        } else if (row.ITEM_NAME.length > 100) {
          errors[`setRow_${index}_ITEM_NAME`] = 'Item Name cannot exceed 100 characters.'
        } else {
          const lower = row.ITEM_NAME.toLowerCase()
          if (seenNames.has(lower)) {
            errors[`setRow_${index}_ITEM_NAME`] = `Duplicate Item Name: '${row.ITEM_NAME}'`
          } else {
            seenNames.add(lower)
          }
        }
      })
    }
  }

  return {
    values: normalized,
    setRows: normalizedSetRows,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
