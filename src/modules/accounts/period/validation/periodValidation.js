/**
 * @file Validation rules and constants for Accounting Period Open.
 */

export const AFM_PERIOD_TABLE = 'AFM_PERIOD'

export const PERIOD_STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Close', label: 'Close' },
]

export const initialPeriodValues = {
  BG_ID: '',
  BU_ID: '',
  PERIOD_YEAR: String(new Date().getFullYear()),
  PERIOD_NAME: '',
  PERIOD_STATUS: 'Open',
  STATUS: '1',
}

/**
 * Validates Accounting Period Open form values.
 * @param {object} values Form values
 * @param {object} sessionValues Session bgId and buId
 * @returns {{ errors: object, isValid: boolean }}
 */
export function validatePeriod(values, sessionValues = {}) {
  const errors = {}

  const bgId = values.BG_ID || sessionValues.BG_ID
  const buId = values.BU_ID || sessionValues.BU_ID

  if (!bgId) {
    errors.BG_ID = 'Business Group is required from session.'
  }
  if (!buId) {
    errors.BU_ID = 'Business Unit is required from session.'
  }
  if (!values.PERIOD_YEAR || !String(values.PERIOD_YEAR).trim()) {
    errors.PERIOD_YEAR = 'Year is required.'
  }
  if (!values.PERIOD_NAME || !String(values.PERIOD_NAME).trim()) {
    errors.PERIOD_NAME = 'Period Name is required.'
  }
  if (!values.PERIOD_STATUS || !String(values.PERIOD_STATUS).trim()) {
    errors.PERIOD_STATUS = 'Period Status is required.'
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

