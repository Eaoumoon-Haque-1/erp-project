/**
 * @file Validation schema and constants for Item Brand (INV_ITEM_BRAND).
 */

export const BRAND_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const initialItemBrandValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  BRAND_NAME: '',
  BRAND_CODE: '',
  STATUS: '1',
}

/**
 * Validates item brand form fields.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItemBrand(values, { isEdit = false } = {}) {
  const errors = {}

  if (!values.BRAND_NAME || !String(values.BRAND_NAME).trim()) {
    errors.BRAND_NAME = 'Brand Name is required'
  } else if (String(values.BRAND_NAME).trim().length > 150) {
    errors.BRAND_NAME = 'Brand Name cannot exceed 150 characters'
  }

  if (isEdit) {
    if (!values.BRAND_CODE || !String(values.BRAND_CODE).trim()) {
      errors.BRAND_CODE = 'Brand Code is required'
    } else if (String(values.BRAND_CODE).trim().length > 50) {
      errors.BRAND_CODE = 'Brand Code cannot exceed 50 characters'
    }
  } else if (values.BRAND_CODE && String(values.BRAND_CODE).trim().length > 50) {
    errors.BRAND_CODE = 'Brand Code cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

