/** @file Validation schema and initial values for Asset Book Register. */

export const ASSET_BOOK_REGISTER_TABLE = 'asset_book_register'

export const initialAssetBookRegisterValues = {
  ID: '',
  BG_ID: '',
  BU_ID: '',

  ASSET_NO: '',
  ASSET_ITEM_ID: '',
  ASSET_UNIT: 'Piece',
  ASSET_MAJOR_CATEGORY_ID: '',
  ASSET_OWNER_ID: '',

  ALLOCATION_TYPE: 'Individual',
  ALLOCATION_REF_ID: '',
  USAGE_STATUS: 'In Use',
  ASSET_CONDITION: 'New',
  ASSET_STATUS: 'Active',
  ALLOCATION_DATE: new Date().toISOString().split('T')[0],

  STATUS: '1',
}

export function validateAssetBookRegister(values, existingRecords = [], selfId = null) {
  const errors = {}

  if (!String(values.ASSET_ITEM_ID || '').trim()) {
    errors.ASSET_ITEM_ID = 'Asset Item is required.'
  }

  if (!String(values.ASSET_UNIT || '').trim()) {
    errors.ASSET_UNIT = 'Asset Unit is required.'
  }

  const assetNo = String(values.ASSET_NO || '').trim()
  if (assetNo && existingRecords.length > 0) {
    const isDuplicate = existingRecords.some(
      (r) =>
        String(r.ID) !== String(selfId) &&
        String(r.ASSET_NO || '').trim().toLowerCase() === assetNo.toLowerCase(),
    )
    if (isDuplicate) {
      errors.ASSET_NO = 'Asset No already exists in this Business Unit.'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      ...values,
      ASSET_NO: assetNo,
    },
  }
}
