/**
 * @file ASSET_ITEM_SPEC defaults and workbook validation rules.
 */
export const ASSET_ITEM_SPEC_TABLE = 'ASSET_ITEM_SPEC'

export const initialAssetSpecificationMapValues = {
  ITEM_NAME: '',
  ITEM_NAME_LABEL: '',
  SPECIFICATION: '',
  SPECIFICATION_NAME: '',
  SORT_ORDER: '1',
  STATUS: '1',
}

export function validateAssetSpecificationMap(
  values,
  existingRecords = [],
  references = {},
) {
  const normalized = {
    ITEM_NAME: String(values.ITEM_NAME ?? ''),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    SPECIFICATION: String(values.SPECIFICATION ?? ''),
    SPECIFICATION_NAME: String(values.SPECIFICATION_NAME ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}
  const { assetItems = [], specificationOptions = [] } = references

  if (!normalized.ITEM_NAME) {
    errors.ITEM_NAME = 'Asset Item Name is required.'
  } else if (!assetItems.some((record) => record.ID === normalized.ITEM_NAME)) {
    errors.ITEM_NAME = 'Select a valid active Asset Item.'
  }

  if (!normalized.SPECIFICATION) {
    errors.SPECIFICATION = 'Specification is required.'
  } else if (!specificationOptions.some(
    (option) => option.value === normalized.SPECIFICATION,
  )) {
    errors.SPECIFICATION = 'Select a valid active Specification.'
  }

  if (!/^[1-9]\d*$/.test(normalized.SORT_ORDER)) {
    errors.SORT_ORDER = 'Sort Order must be a positive whole number.'
  }

  const duplicate = existingRecords.some((record) => (
    String(record.ITEM_NAME) === normalized.ITEM_NAME
    && String(record.SPECIFICATION) === normalized.SPECIFICATION
  ))
  if (duplicate) {
    errors.SPECIFICATION = 'This Specification is already mapped to the selected Asset Item.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
