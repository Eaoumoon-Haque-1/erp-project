/**
 * @file Data contract and validation rules for Asset Group.
 * Spreadsheet table: ASSET_GROUP.
 */
export const ASSET_GROUP_TABLE = 'ASSET_GROUP'

export const initialAssetGroupValues = {
  ASSET_GROUP: '',
  ASSET_OWNER_ID: '',
  ASSET_OWNER_NAME: '',
  STATUS: '1',
}

export function validateAssetGroup(values, existingRecords = []) {
  const normalizedValues = {
    ASSET_GROUP: String(values.ASSET_GROUP ?? '').trim(),
    ASSET_OWNER_ID: String(values.ASSET_OWNER_ID ?? ''),
    ASSET_OWNER_NAME: String(values.ASSET_OWNER_NAME ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.ASSET_GROUP) {
    errors.ASSET_GROUP = 'Asset Group is required.'
  }

  if (!normalizedValues.ASSET_OWNER_ID) {
    errors.ASSET_OWNER_ID = 'Asset Owner is required.'
  }

  const duplicateMapping = existingRecords.some((record) => (
    String(record.ASSET_GROUP).trim().toLowerCase()
      === normalizedValues.ASSET_GROUP.toLowerCase()
    && String(record.ASSET_OWNER_ID) === normalizedValues.ASSET_OWNER_ID
  ))

  if (duplicateMapping) {
    errors.ASSET_GROUP = 'This Asset Group and Asset Owner mapping already exists.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

