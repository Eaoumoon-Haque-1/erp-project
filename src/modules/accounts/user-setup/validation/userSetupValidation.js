/**
 * @file Validation rules and constants for User Setup (AFM_USER_SETUP).
 */

export const VOUCHER_DATE_OPTIONS = [
  { value: 'Current date data entry allowed', label: 'Current date data entry allowed' },
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
  IS_ALL_ACC_HEAD_ALLOWED: '1',
  STATUS: '1',
  ALLOWED_ACCOUNTS: [],
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

  // When IS_ALL_ACC_HEAD_ALLOWED is Not Allowed ('0'), validate ALLOWED_ACCOUNTS
  if (String(values.IS_ALL_ACC_HEAD_ALLOWED ?? '1') === '0') {
    const rawList = values.ALLOWED_ACCOUNTS || []
    const filledList = rawList.filter(
      (item) => item && item.ACCOUNT_HEAD_ID != null && String(item.ACCOUNT_HEAD_ID).trim() !== '',
    )

    if (filledList.length === 0) {
      errors.ALLOWED_ACCOUNTS =
        'At least one Accounts Name must be selected when All Accounts Head is Not Allowed.'
    } else {
      const seen = new Set()
      const duplicates = []
      for (const item of filledList) {
        const id = String(item.ACCOUNT_HEAD_ID).trim()
        if (seen.has(id)) {
          const name = item.ACCOUNT_DISPLAY_LABEL || item.ACCOUNT_HEAD_NAME || `ID: ${id}`
          duplicates.push(name)
        } else {
          seen.add(id)
        }
      }
      if (duplicates.length > 0) {
        errors.ALLOWED_ACCOUNTS = `Same Accounts Name is not allowed to be submitted against one user (${duplicates.join(', ')}).`
      }
    }
  }

  return errors
}

