/**
 * @file Validation schema and constants for Item Attribute (INV_ITEM_ATTRIBUTE).
 */

export const ATTRIBUTE_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const initialItemAttributeValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  ATTRIBUTE_NAME: '',
  ATTRIBUTE_CODE: '',
  STATUS: '1',
}

/**
 * Validates item attribute form fields.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItemAttribute(values, { isEdit = false } = {}) {
  const errors = {}

  if (!values.ATTRIBUTE_NAME || !String(values.ATTRIBUTE_NAME).trim()) {
    errors.ATTRIBUTE_NAME = 'Attribute Name is required'
  } else if (String(values.ATTRIBUTE_NAME).trim().length > 150) {
    errors.ATTRIBUTE_NAME = 'Attribute Name cannot exceed 150 characters'
  }

  if (isEdit) {
    if (!values.ATTRIBUTE_CODE || !String(values.ATTRIBUTE_CODE).trim()) {
      errors.ATTRIBUTE_CODE = 'Attribute Code is required'
    } else if (String(values.ATTRIBUTE_CODE).trim().length > 50) {
      errors.ATTRIBUTE_CODE = 'Attribute Code cannot exceed 50 characters'
    }
  } else if (values.ATTRIBUTE_CODE && String(values.ATTRIBUTE_CODE).trim().length > 50) {
    errors.ATTRIBUTE_CODE = 'Attribute Code cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

