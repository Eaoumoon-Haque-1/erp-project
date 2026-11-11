/**
 * @file Validation schema and constants for Item Warehouse (INV_ITEM_WAREHOUSE).
 */

export const WAREHOUSE_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const WAREHOUSE_DEFAULT_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

export const initialItemWarehouseValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  WAREHOUSE_NAME: '',
  WAREHOUSE_CODE: '',
  IS_DEFAULT: '0',
  STORE_ID: '',
  STATUS: '1',
}

/**
 * Validates item warehouse form fields.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItemWarehouse(values, { isEdit = false } = {}) {
  const errors = {}

  if (!values.WAREHOUSE_NAME || !String(values.WAREHOUSE_NAME).trim()) {
    errors.WAREHOUSE_NAME = 'Warehouse Name is required'
  } else if (String(values.WAREHOUSE_NAME).trim().length > 150) {
    errors.WAREHOUSE_NAME = 'Warehouse Name cannot exceed 150 characters'
  }

  if (isEdit) {
    if (!values.WAREHOUSE_CODE || !String(values.WAREHOUSE_CODE).trim()) {
      errors.WAREHOUSE_CODE = 'Warehouse Code is required'
    } else if (String(values.WAREHOUSE_CODE).trim().length > 50) {
      errors.WAREHOUSE_CODE = 'Warehouse Code cannot exceed 50 characters'
    }
  } else if (values.WAREHOUSE_CODE && String(values.WAREHOUSE_CODE).trim().length > 50) {
    errors.WAREHOUSE_CODE = 'Warehouse Code cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

