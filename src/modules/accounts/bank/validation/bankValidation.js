/**
 * @file Form schema, initial values, constants, and validation rules for AFM Bank & Bank Details.
 */

export const AFM_BANK_TABLE = 'AFM_BANK'
export const AFM_BANK_DTLS_TABLE = 'AFM_BANK_DTLS'

export const initialBankValues = {
  BG_ID: '',
  BU_ID: '',
  BANK_NAME: '',
  SHORT_NAME: '',
  STATUS: '1',
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Current Account', label: 'Current Account' },
  { value: 'Savings Account', label: 'Savings Account' },
  { value: 'Short Term Deposit (STD)', label: 'Short Term Deposit (STD)' },
  { value: 'Fixed Deposit Receipt (FDR)', label: 'Fixed Deposit Receipt (FDR)' },
  { value: 'Special Notice Deposit (SND)', label: 'Special Notice Deposit (SND)' },
  { value: 'Cash Credit (CC)', label: 'Cash Credit (CC)' },
  { value: 'Loan Account', label: 'Loan Account' },
  { value: 'Overdraft (OD)', label: 'Overdraft (OD)' },
  { value: 'Foreign Currency Account', label: 'Foreign Currency Account' },
]

export function createInitialBankDetailRow(overrides = {}) {
  return {
    _ROW_ID: `row_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ID: '',
    BRANCH_NAME: '',
    ADDRESS: '',
    ACCOUNT_TYPE: 'Current Account',
    ACCOUNT_NAME: '',
    ACCOUNT_NUMBER: '',
    OPENING_DATE: '',
    OPENING_BALANCE: '0.00',
    STATUS: '1',
    ...overrides,
  }
}

/**
 * Validates bank master fields and detail account rows.
 * @param {object} values Master form fields
 * @param {Array} rows Array of detail account rows
 * @returns {{ isValid: boolean, values: object, rows: Array, errors: object }}
 */
export function validateBank(values = {}, rows = []) {
  const errors = {}
  const subRows = {}

  const normalizedValues = {
    ...values,
    BANK_NAME: String(values.BANK_NAME ?? '').trim(),
    SHORT_NAME: String(values.SHORT_NAME ?? '').trim(),
  }

  // Master validations
  if (!values.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }
  if (!values.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.BANK_NAME) {
    errors.BANK_NAME = 'Bank Name is required.'
  } else if (normalizedValues.BANK_NAME.length < 2) {
    errors.BANK_NAME = 'Bank Name must be at least 2 characters.'
  } else if (normalizedValues.BANK_NAME.length > 150) {
    errors.BANK_NAME = 'Bank Name cannot exceed 150 characters.'
  }

  if (normalizedValues.SHORT_NAME && normalizedValues.SHORT_NAME.length > 50) {
    errors.SHORT_NAME = 'Short Name cannot exceed 50 characters.'
  }

  // Check duplicate account numbers across rows
  const seenAccNumbers = new Map()
  const duplicateRowIds = new Set()

  rows.forEach((row) => {
    const accNum = String(row.ACCOUNT_NUMBER ?? '').trim().toLowerCase()
    if (accNum) {
      if (seenAccNumbers.has(accNum)) {
        duplicateRowIds.add(row._ROW_ID)
        duplicateRowIds.add(seenAccNumbers.get(accNum))
      } else {
        seenAccNumbers.set(accNum, row._ROW_ID)
      }
    }
  })

  // Validate individual detail rows
  const normalizedRows = rows.map((row) => {
    const rowErrors = {}
    const accountName = String(row.ACCOUNT_NAME ?? '').trim()
    const accountNumber = String(row.ACCOUNT_NUMBER ?? '').trim()
    const balance = String(row.OPENING_BALANCE ?? '').trim()

    if (!accountName) {
      rowErrors.ACCOUNT_NAME = 'Account Name is required.'
    } else if (accountName.length < 2) {
      rowErrors.ACCOUNT_NAME = 'Account Name must be at least 2 characters.'
    } else if (accountName.length > 150) {
      rowErrors.ACCOUNT_NAME = 'Account Name cannot exceed 150 characters.'
    }

    if (!accountNumber) {
      rowErrors.ACCOUNT_NUMBER = 'Account Number is required.'
    } else if (accountNumber.length > 50) {
      rowErrors.ACCOUNT_NUMBER = 'Account Number cannot exceed 50 characters.'
    } else if (duplicateRowIds.has(row._ROW_ID)) {
      rowErrors.ACCOUNT_NUMBER = 'Account Number must be unique.'
    }

    if (balance !== '') {
      const numBalance = Number(balance)
      if (Number.isNaN(numBalance) || numBalance < 0) {
        rowErrors.OPENING_BALANCE = 'Opening Balance must be a positive number.'
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      subRows[row._ROW_ID] = rowErrors
    }

    return {
      ...row,
      BRANCH_NAME: String(row.BRANCH_NAME ?? '').trim(),
      ADDRESS: String(row.ADDRESS ?? '').trim(),
      ACCOUNT_TYPE: String(row.ACCOUNT_TYPE ?? 'Current Account').trim(),
      ACCOUNT_NAME: accountName,
      ACCOUNT_NUMBER: accountNumber,
      OPENING_DATE: row.OPENING_DATE || '',
      OPENING_BALANCE: balance || '0.00',
      STATUS: String(row.STATUS ?? '1'),
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
