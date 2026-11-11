/**
 * @file Validation schema and constants for Item Category (INV_ITEM_CATEGORY).
 */

export const CATEGORY_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const initialItemCategoryValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  CATEGORY_NAME: '',
  CATEGORY_CODE: '',
  STATUS: '1',
}

/**
 * Validates item category form fields.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItemCategory(values, { isEdit = false } = {}) {
  const errors = {}

  if (!values.CATEGORY_NAME || !String(values.CATEGORY_NAME).trim()) {
    errors.CATEGORY_NAME = 'Category Name is required'
  } else if (String(values.CATEGORY_NAME).trim().length > 150) {
    errors.CATEGORY_NAME = 'Category Name cannot exceed 150 characters'
  }

  if (isEdit) {
    if (!values.CATEGORY_CODE || !String(values.CATEGORY_CODE).trim()) {
      errors.CATEGORY_CODE = 'Category Code is required'
    } else if (String(values.CATEGORY_CODE).trim().length > 50) {
      errors.CATEGORY_CODE = 'Category Code cannot exceed 50 characters'
    }
  } else if (values.CATEGORY_CODE && String(values.CATEGORY_CODE).trim().length > 50) {
    errors.CATEGORY_CODE = 'Category Code cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

