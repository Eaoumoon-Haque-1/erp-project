/**
 * @file Validation schema and constants for Item Store (INV_ITEM_STORE).
 */

export const STORE_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const STORE_DEFAULT_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

export const initialItemStoreValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  STORE_NAME: '',
  STORE_CODE: '',
  IS_DEFAULT: '0',
  STATUS: '1',
}

/**
 * Validates item store form fields.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItemStore(values, { isEdit = false } = {}) {
  const errors = {}

  if (!values.STORE_NAME || !String(values.STORE_NAME).trim()) {
    errors.STORE_NAME = 'Store Name is required'
  } else if (String(values.STORE_NAME).trim().length > 150) {
    errors.STORE_NAME = 'Store Name cannot exceed 150 characters'
  }

  if (isEdit) {
    if (!values.STORE_CODE || !String(values.STORE_CODE).trim()) {
      errors.STORE_CODE = 'Store Code is required'
    } else if (String(values.STORE_CODE).trim().length > 50) {
      errors.STORE_CODE = 'Store Code cannot exceed 50 characters'
    }
  } else if (values.STORE_CODE && String(values.STORE_CODE).trim().length > 50) {
    errors.STORE_CODE = 'Store Code cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

