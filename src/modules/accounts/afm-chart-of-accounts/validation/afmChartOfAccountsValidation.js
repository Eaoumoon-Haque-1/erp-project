/**
 * @file Backend-facing data contract and client validation for AFM Chart of Accounts.
 * Exact table: AFM_CHART_OF_ACCOUNTS.
 */
export const AFM_CHART_OF_ACCOUNTS_TABLE = 'AFM_CHART_OF_ACCOUNTS'

export const LEDGER_HEAD_OPTIONS = [
  'Title Account',
  'Control Account',
  'Active Account',
]

export const ACCOUNT_HEAD_TYPE_OPTIONS = [
  'Asset',
  'Expenditure',
  'Income',
  'Liability',
  'Equity',
]

export const ACCOUNT_USAGE_OPTIONS = [
  'Bank',
  'Cash',
  'Ledger',
  'Inter Company',
  'None',
]

export const ACCOUNTS_SOURCE_OPTIONS = [
  'Customer',
  'Supplier',
  'Employee',
  'Loan Master',
  'Farm Shed',
  'None',
]

export const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const initialAfmChartOfAccountsValues = {
  BG_ID: '',
  BU_ID: '',
  ACCOUNT_CODE: '',
  ACCOUNT_HEAD_NAME: '',
  LEDGER_HEAD: 'Title Account',
  ACCOUNT_HEAD_TYPE: 'Asset',
  PARENT_ACCOUNT_HEAD: '',
  PARENT_ACCOUNT_CODE: '',
  SORT_ORDER: '',
  ACCOUNT_USAGE: 'None',
  ACCOUNTS_SOURCE: 'None',
  IS_COST_CENTER_MANDATORY: '0',
  IS_BUDGET_ACC_HEAD: '0',
  LEVEL: '1',
  STATUS: '1',
}

export function validateAfmChartOfAccounts(values, existingAccounts = [], currentId = null) {
  const normalizedValues = {
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    ACCOUNT_CODE: String(values.ACCOUNT_CODE ?? '').trim(),
    ACCOUNT_HEAD_NAME: String(values.ACCOUNT_HEAD_NAME ?? '').trim(),
    LEDGER_HEAD: String(values.LEDGER_HEAD ?? '').trim(),
    ACCOUNT_HEAD_TYPE: String(values.ACCOUNT_HEAD_TYPE ?? '').trim(),
    PARENT_ACCOUNT_HEAD: String(values.PARENT_ACCOUNT_HEAD ?? '').trim(),
    PARENT_ACCOUNT_CODE: String(values.PARENT_ACCOUNT_CODE ?? '').trim(),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    ACCOUNT_USAGE: String(values.ACCOUNT_USAGE ?? 'None').trim() || 'None',
    ACCOUNTS_SOURCE: String(values.ACCOUNTS_SOURCE ?? 'None').trim() || 'None',
    IS_COST_CENTER_MANDATORY: String(values.IS_COST_CENTER_MANDATORY) === '1' ? '1' : '0',
    IS_BUDGET_ACC_HEAD: String(values.IS_BUDGET_ACC_HEAD) === '1' ? '1' : '0',
    LEVEL: String(values.LEVEL ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }

  const errors = {}

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.ACCOUNT_CODE) {
    errors.ACCOUNT_CODE = 'Account Code is required.'
  } else if (normalizedValues.ACCOUNT_CODE.length > 50) {
    errors.ACCOUNT_CODE = 'Account Code must not exceed 50 characters.'
  } else if (existingAccounts.some((item) =>
    String(item.id ?? item.ID) !== String(currentId) &&
    String(item.buId ?? item.BU_ID) === normalizedValues.BU_ID &&
    String(item.accountCode ?? item.ACCOUNT_CODE).trim().toLowerCase() === normalizedValues.ACCOUNT_CODE.toLowerCase()
  )) {
    errors.ACCOUNT_CODE = 'Account Code must be unique within the selected Business Unit.'
  }

  if (!normalizedValues.ACCOUNT_HEAD_NAME) {
    errors.ACCOUNT_HEAD_NAME = 'Account Head is required.'
  } else if (normalizedValues.ACCOUNT_HEAD_NAME.length < 2) {
    errors.ACCOUNT_HEAD_NAME = 'Account Head must be at least 2 characters.'
  } else if (normalizedValues.ACCOUNT_HEAD_NAME.length > 150) {
    errors.ACCOUNT_HEAD_NAME = 'Account Head must not exceed 150 characters.'
  } else if (existingAccounts.some((item) =>
    String(item.id ?? item.ID) !== String(currentId) &&
    String(item.buId ?? item.BU_ID) === normalizedValues.BU_ID &&
    String(item.accountHeadName ?? item.ACCOUNT_HEAD_NAME).trim().toLowerCase() === normalizedValues.ACCOUNT_HEAD_NAME.toLowerCase()
  )) {
    errors.ACCOUNT_HEAD_NAME = 'Account Head must be unique within the selected Business Unit.'
  }

  if (!normalizedValues.LEDGER_HEAD) {
    errors.LEDGER_HEAD = 'Ledger Head is required.'
  } else if (!LEDGER_HEAD_OPTIONS.some((opt) => opt.toLowerCase() === normalizedValues.LEDGER_HEAD.toLowerCase())) {
    errors.LEDGER_HEAD = `Ledger Head must be one of: ${LEDGER_HEAD_OPTIONS.join(', ')}.`
  }

  if (!normalizedValues.ACCOUNT_HEAD_TYPE) {
    errors.ACCOUNT_HEAD_TYPE = 'Account Type is required.'
  } else if (!ACCOUNT_HEAD_TYPE_OPTIONS.some((opt) => opt.toLowerCase() === normalizedValues.ACCOUNT_HEAD_TYPE.toLowerCase())) {
    errors.ACCOUNT_HEAD_TYPE = `Account Type must be one of: ${ACCOUNT_HEAD_TYPE_OPTIONS.join(', ')}.`
  }

  if (normalizedValues.PARENT_ACCOUNT_HEAD && currentId && String(normalizedValues.PARENT_ACCOUNT_HEAD) === String(currentId)) {
    errors.PARENT_ACCOUNT_HEAD = 'An account cannot be its own parent account.'
  }

  if (normalizedValues.SORT_ORDER) {
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValues.SORT_ORDER) || Number(normalizedValues.SORT_ORDER) <= 0) {
      errors.SORT_ORDER = 'Sort Order must be a positive number greater than 0.'
    }
  }

  if (normalizedValues.LEVEL) {
    if (!/^\d+$/.test(normalizedValues.LEVEL) || Number(normalizedValues.LEVEL) < 1) {
      errors.LEVEL = 'Level must be a positive integer.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
