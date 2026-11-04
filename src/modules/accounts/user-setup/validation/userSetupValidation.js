/**
 * @file Validation rules and constants for User Setup (AFM_USER_SETUP).
 */

export const VOUCHER_DATE_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Previous date data entry allowed', label: 'Previous date data entry allowed' },
  { value: 'Forward date data entry allowed', label: 'Forward date data entry allowed' },
]

export const USER_SETUP_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const initialUserSetupValues = {
  USER_ID: '',
  VOUCHER_DATE: [],
  VOUCHER_TYPE: [],
  VOUCHER_TYPE_DEFAULT: '',
  LOCATION: [],
  LOCATION_DEFAULT: '',
  BANK_ACCOUNT: [],
  BANK_ACCOUNT_DEFAULT: '',
  COST_CENTER: [],
  COST_CENTER_DEFAULT: '',
  STATUS: '1',
}

/**
 * Validates the User Setup form values.
 * @param {object} values Form values
 * @returns {object} Errors object mapped by field key
 */
export function validateUserSetup(values = {}) {
  const errors = {}

  if (!values.USER_ID || !String(values.USER_ID).trim()) {
    errors.USER_ID = 'User is required'
  }

  return errors
}

