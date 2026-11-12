/**
 * @file Validation schema and constants for Item Master and Item Attribute Details.
 */

export const ITEM_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const WARRANTY_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

export const initialItemValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  ITEM_NAME: '',
  ITEM_CODE: '',
  CATEGORY_ID: '',
  CATEGORY_NAME: '',
  BRAND_ID: '',
  BRAND_NAME: '',
  UOM_ID: '',
  UOM_NAME: '',
  STORE_ID: [],
  STORE_NAME: '',
  ITEM_IMAGE: '',
  IS_WARRANTY_APPLICABLE: '0',
  WARRANTY_DAY: '',
  WARRANTY_CRITERIA: '',
  STATUS: '1',
}

let rowCounter = 0
export function createDefaultAttributeRow(initial = {}) {
  rowCounter += 1
  return {
    _ROW_ID: `row_${Date.now()}_${rowCounter}`,
    ID: initial.ID ? String(initial.ID) : '',
    ATTRIBUTE_ID: initial.ATTRIBUTE_ID ? String(initial.ATTRIBUTE_ID) : '',
    ATTRIBUTE_NAME: initial.ATTRIBUTE_NAME || '',
    PRICE: initial.PRICE != null ? String(initial.PRICE) : '',
    OPENING_STOCK: initial.OPENING_STOCK != null ? String(initial.OPENING_STOCK) : '',
    STATUS: initial.STATUS != null ? String(initial.STATUS) : '1',
  }
}

/**
 * Validates master Item values and child detail rows.
 * @param {object} values Form values
 * @param {Array} rows Child attribute detail rows
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false]
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateItem(values, rows = [], { isEdit = false } = {}) {
  const errors = {
    subRows: {},
  }

  // 1. Item Name
  if (!values.ITEM_NAME || !String(values.ITEM_NAME).trim()) {
    errors.ITEM_NAME = 'Item Name is required'
  } else if (String(values.ITEM_NAME).trim().length > 150) {
    errors.ITEM_NAME = 'Item Name cannot exceed 150 characters'
  }

  // 2. Item Code
  if (isEdit) {
    if (!values.ITEM_CODE || !String(values.ITEM_CODE).trim()) {
      errors.ITEM_CODE = 'Item Code is required'
    } else if (String(values.ITEM_CODE).trim().length > 50) {
      errors.ITEM_CODE = 'Item Code cannot exceed 50 characters'
    }
  } else if (values.ITEM_CODE && String(values.ITEM_CODE).trim().length > 50) {
    errors.ITEM_CODE = 'Item Code cannot exceed 50 characters'
  }

  // 3. Warranty Days validation if warranty applicable
  if (String(values.IS_WARRANTY_APPLICABLE) === '1') {
    if (values.WARRANTY_DAY !== '' && values.WARRANTY_DAY != null) {
      const days = Number(values.WARRANTY_DAY)
      if (Number.isNaN(days) || days < 0) {
        errors.WARRANTY_DAY = 'Warranty days must be a non-negative number'
      }
    }
  }

  // 4. Validate Child Rows
  const seenAttributes = new Set()
  let hasRowError = false

  rows.forEach((row, idx) => {
    const rowErrors = {}

    if (!row.ATTRIBUTE_ID) {
      rowErrors.ATTRIBUTE_ID = 'Attribute is required'
    } else {
      const attrKey = String(row.ATTRIBUTE_ID)
      if (seenAttributes.has(attrKey)) {
        rowErrors.ATTRIBUTE_ID = `Duplicate attribute on row ${idx + 1}`
      } else {
        seenAttributes.add(attrKey)
      }
    }

    if (row.PRICE !== '' && row.PRICE != null) {
      const price = Number(row.PRICE)
      if (Number.isNaN(price) || price < 0) {
        rowErrors.PRICE = 'Price cannot be negative'
      }
    }

    if (row.OPENING_STOCK !== '' && row.OPENING_STOCK != null) {
      const stock = Number(row.OPENING_STOCK)
      if (Number.isNaN(stock) || stock < 0) {
        rowErrors.OPENING_STOCK = 'Stock cannot be negative'
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.subRows[row._ROW_ID] = rowErrors
      hasRowError = true
    }
  })

  const topLevelErrors = Object.keys(errors).filter((k) => k !== 'subRows')
  const isValid = topLevelErrors.length === 0 && !hasRowError

  return {
    isValid,
    errors,
  }
}

