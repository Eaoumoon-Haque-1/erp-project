/** @file Form defaults and client validation for the backend `AfmCoa` resource. */
export const CHART_OF_ACCOUNTS_TABLE = 'AFM_COA'

export const initialChartOfAccountsValues = {
  SL_NO: '',
  COMPANY_ID: '',
  ACCOUNT_CODE: '',
  ACCOUNT_HEAD: '',
  LEDGER_HEAD_TYPE: '',
  ACCOUNT_TYPE: '',
  PARENT_ACCOUNT_HEAD_ID: '',
  ACCOUNT_USAGE: '',
  IS_COST_CENTER_MANDATORY: '0',
  IS_BUDGET_HEAD: '0',
  OPENING_DATE: '',
  OPENING_BALANCE: '0',
  BALANCE_DR: '0',
  BALANCE_CR: '0',
  CURRENT_DR: '0',
  CURRENT_CR: '0',
  STATUS: '1',
}

export function validateChartOfAccounts(values) {
  const normalized = {
    ...values,
    ACCOUNT_CODE: String(values.ACCOUNT_CODE ?? '').trim(),
    ACCOUNT_HEAD: String(values.ACCOUNT_HEAD ?? '').trim(),
    LEDGER_HEAD_TYPE: String(values.LEDGER_HEAD_TYPE ?? '').trim(),
    ACCOUNT_TYPE: String(values.ACCOUNT_TYPE ?? '').trim(),
    ACCOUNT_USAGE: String(values.ACCOUNT_USAGE ?? '').trim(),
  }
  const errors = {}

  if (!normalized.SL_NO || Number(normalized.SL_NO) <= 0 || !Number.isInteger(Number(normalized.SL_NO))) {
    errors.SL_NO = 'SL No. must be a whole number greater than 0.'
  }
  if (!normalized.COMPANY_ID || Number(normalized.COMPANY_ID) <= 0 || !Number.isInteger(Number(normalized.COMPANY_ID))) {
    errors.COMPANY_ID = 'Company ID must be a whole number greater than 0.'
  }
  if (!normalized.ACCOUNT_CODE) errors.ACCOUNT_CODE = 'Account Code is required.'
  if (!normalized.ACCOUNT_HEAD) errors.ACCOUNT_HEAD = 'Account Head is required.'
  if (!normalized.LEDGER_HEAD_TYPE) errors.LEDGER_HEAD_TYPE = 'Ledger Head Type is required.'
  if (!normalized.ACCOUNT_TYPE) errors.ACCOUNT_TYPE = 'Account Type is required.'

  ;['OPENING_BALANCE', 'BALANCE_DR', 'BALANCE_CR', 'CURRENT_DR', 'CURRENT_CR'].forEach((key) => {
    if (normalized[key] !== '' && !Number.isFinite(Number(normalized[key]))) {
      errors[key] = 'Enter a valid amount.'
    }
  })

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
