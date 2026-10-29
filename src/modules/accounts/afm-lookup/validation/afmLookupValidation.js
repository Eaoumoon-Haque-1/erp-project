/**
 * @file Form schema, initial values, constants, and validation rules for AFM Lookup Type & Lookup Values.
 */

export const AFM_LOOKUP_TYPE_TABLE = 'AFM_LOOKUP_TYPE'
export const AFM_LOOKUP_VALUE_TABLE = 'AFM_LOOKUP_VALUE'

export const initialLookupTypeValues = {
  BG_ID: '',
  BU_ID: '',
  TYPE_NAME: '',
  TYPE_CODE: '',
  STATUS: '1',
}

export function createInitialLookupValueRow(overrides = {}, defaultIndex = 1) {
  return {
    _ROW_ID: `row_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ID: '',
    VALUE: '',
    VALUE_CODE: '',
    NOTE: '',
    SORT_ORDER: String(defaultIndex),
    STATUS: '1',
    IN_USE: false,
    ...overrides,
  }
}

/**
 * Validates lookup type master fields and detail lookup value rows.
 * @param {object} values Master form fields
 * @param {Array} rows Array of detail lookup value rows
 * @returns {{ isValid: boolean, values: object, rows: Array, errors: object }}
 */
export function validateAfmLookup(values = {}, rows = []) {
  const errors = {}
  const subRows = {}

  const normalizedValues = {
    ...values,
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    TYPE_NAME: String(values.TYPE_NAME ?? '').trim(),
    TYPE_CODE: String(values.TYPE_CODE ?? '').trim(),
    STATUS: String(values.STATUS ?? '1'),
  }

  // Master validations
  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.TYPE_NAME) {
    errors.TYPE_NAME = 'Lookup Type is required.'
  } else if (normalizedValues.TYPE_NAME.length < 2) {
    errors.TYPE_NAME = 'Lookup Type must be at least 2 characters.'
  } else if (normalizedValues.TYPE_NAME.length > 150) {
    errors.TYPE_NAME = 'Lookup Type cannot exceed 150 characters.'
  }

  if (normalizedValues.TYPE_CODE && normalizedValues.TYPE_CODE.length > 50) {
    errors.TYPE_CODE = 'Lookup Code cannot exceed 50 characters.'
  }

  // Check duplicate values and codes across rows
  const seenValues = new Map()
  const duplicateValueRowIds = new Set()
  const seenCodes = new Map()
  const duplicateCodeRowIds = new Set()

  rows.forEach((row) => {
    const val = String(row.VALUE ?? '').trim().toLowerCase()
    if (val) {
      if (seenValues.has(val)) {
        duplicateValueRowIds.add(row._ROW_ID)
        duplicateValueRowIds.add(seenValues.get(val))
      } else {
        seenValues.set(val, row._ROW_ID)
      }
    }

    const code = String(row.VALUE_CODE ?? '').trim().toLowerCase()
    if (code) {
      if (seenCodes.has(code)) {
        duplicateCodeRowIds.add(row._ROW_ID)
        duplicateCodeRowIds.add(seenCodes.get(code))
      } else {
        seenCodes.set(code, row._ROW_ID)
      }
    }
  })

  // Validate individual detail rows
  const normalizedRows = rows.map((row, index) => {
    const rowErrors = {}
    const val = String(row.VALUE ?? '').trim()
    const code = String(row.VALUE_CODE ?? '').trim()
    const note = String(row.NOTE ?? '').trim()
    const sortOrder = String(row.SORT_ORDER ?? '').trim()

    if (!val) {
      rowErrors.VALUE = 'Lookup Value is required.'
    } else if (val.length > 150) {
      rowErrors.VALUE = 'Lookup Value cannot exceed 150 characters.'
    } else if (duplicateValueRowIds.has(row._ROW_ID)) {
      rowErrors.VALUE = 'Lookup Value must be unique in this list.'
    }

    if (code && code.length > 50) {
      rowErrors.VALUE_CODE = 'Lookup Value Code cannot exceed 50 characters.'
    } else if (code && duplicateCodeRowIds.has(row._ROW_ID)) {
      rowErrors.VALUE_CODE = 'Lookup Value Code must be unique in this list.'
    }

    if (note && note.length > 200) {
      rowErrors.NOTE = 'Note cannot exceed 200 characters.'
    }

    if (sortOrder !== '') {
      const num = Number(sortOrder)
      if (Number.isNaN(num) || num < 0) {
        rowErrors.SORT_ORDER = 'Sort Order cannot be negative.'
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      subRows[row._ROW_ID] = rowErrors
    }

    return {
      ...row,
      VALUE: val,
      VALUE_CODE: code,
      NOTE: note,
      SORT_ORDER: sortOrder !== '' ? sortOrder : String(index + 1),
      STATUS: String(row.STATUS ?? '1'),
      IN_USE: Boolean(row.IN_USE),
    }
  })

  if (Object.keys(subRows).length > 0) {
    errors.subRows = subRows
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    values: normalizedValues,
    rows: normalizedRows,
    errors,
  }
}
