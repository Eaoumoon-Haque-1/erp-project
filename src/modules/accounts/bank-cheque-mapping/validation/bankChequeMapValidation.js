/**
 * @file Validation schema and constants for Bank Cheque Mapping.
 */

export const AFM_BANK_CHEQUE_MAP_TABLE = 'AFM_BANK_CHEQUE_MAP'

export const CHEQUE_STATUS_OPTIONS = [
  { value: 'Not Use', label: 'Not Use' },
  { value: 'Void', label: 'Void' },
  { value: 'Used', label: 'Used' },
]

export const initialBankChequeMapValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT_NAME: '',
  BANK_ID: '',
  BANK_ACCOUNT_ID: '',
  CHEQUE_NO_FROM: '',
  CHEQUE_NO_TO: '',
  CHEQUE_NO: '',
  CHEQUE_STATUS: 'Not Use',
  STATUS: '1',
}

/**
 * Converts a positive number to English words with the first letter capitalized.
 * E.g., 5 -> "Five", 10 -> "Ten", 25 -> "Twenty Five"
 */
export function numberToWords(num) {
  const n = Math.floor(Number(num))
  if (isNaN(n) || n <= 0) return 'Zero'
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ]

  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
  if (n < 1000) {
    return (
      ones[Math.floor(n / 100)] +
      ' Hundred' +
      (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '')
    )
  }
  if (n < 1000000) {
    return (
      numberToWords(Math.floor(n / 1000)) +
      ' Thousand' +
      (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '')
    )
  }
  return String(n)
}

/**
 * Validates the Bank Cheque Mapping form values.
 * @param {object} values Form values
 * @param {object} [options={}] Validation options
 * @param {boolean} [options.isEdit=false] Whether currently editing
 * @returns {{ errors: object, isValid: boolean, count: number }}
 */
export function validateBankChequeMap(values, { isEdit = false } = {}) {
  const errors = {}
  let count = 0

  if (!values.BG_ID) {
    errors.BG_ID = 'Group Name is required from session.'
  }
  if (!values.BU_ID) {
    errors.BU_ID = 'Business Unit is required from session.'
  }
  if (!values.BANK_ID) {
    errors.BANK_ID = 'Bank Name is required.'
  }
  if (!values.BANK_ACCOUNT_ID) {
    errors.BANK_ACCOUNT_ID = 'Bank Account No is required.'
  }

  if (!isEdit) {
    const fromStr = String(values.CHEQUE_NO_FROM || '').trim()
    const toStr = String(values.CHEQUE_NO_TO || '').trim()

    if (!fromStr) {
      errors.CHEQUE_NO_FROM = 'From Cheque is required.'
    } else if (!/^\d+$/.test(fromStr)) {
      errors.CHEQUE_NO_FROM = 'From Cheque must contain digits only.'
    }

    if (!toStr) {
      errors.CHEQUE_NO_TO = 'To Cheque is required.'
    } else if (!/^\d+$/.test(toStr)) {
      errors.CHEQUE_NO_TO = 'To Cheque must contain digits only.'
    }

    if (!errors.CHEQUE_NO_FROM && !errors.CHEQUE_NO_TO) {
      const from = parseInt(fromStr, 10)
      const to = parseInt(toStr, 10)

      if (to <= from) {
        errors.CHEQUE_NO_TO = 'To Cheque must be greater than From Cheque.'
      } else {
        count = to - from
        if (count > 500) {
          errors.CHEQUE_NO_TO = 'Maximum allowed range is 500 cheques.'
        }
      }
    }
  }

  if (!values.CHEQUE_STATUS) {
    errors.CHEQUE_STATUS = 'Cheque Status is required.'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    count,
  }
}

