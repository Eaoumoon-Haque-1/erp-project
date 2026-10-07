/**
 * @file Backend-facing data contract and client validation for Sales Agreement.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const SALES_AGREEMENT_TABLE = 'HR_SALES_AGREEMENT'

export const temporaryBusinessUnits = [
  { ID: '1', BUSINESS_UNIT: 'Head Office' },
  { ID: '2', BUSINESS_UNIT: 'Factory Unit' },
  { ID: '3', BUSINESS_UNIT: 'Sales Office' },
]

export const temporarySalesPeople = [
  { ID: '1', EMPLOYEE_NAME: 'Samira Rahman' },
  { ID: '2', EMPLOYEE_NAME: 'Tanvir Hasan' },
  { ID: '3', EMPLOYEE_NAME: 'Md. Eaoumoon Haque' },
]

export const billingCycleOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
]

export const billingAfterOptions = ['30', '90', '180', '365']

export const productOptions = [
  { value: 'HR_XPERT', label: 'HR Xpert' },
  { value: 'CLOUD_ERP', label: 'Cloud ERP' },
]

export const moduleOptions = [
  { value: 'HRIS', label: 'HRIS' },
  { value: 'PAYROLL', label: 'Payroll' },
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'SALES', label: 'Sales' },
]

export const subscriptionStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'TERMINATED', label: 'Terminated' },
]

export const initialSalesAgreementValues = {
  BU_ID: '',
  AGREEMENT_NO: '',
  AGREEMENT_DATE: '',
  CUSTOMER: '',
  SALES_PERSON_ID: '',
  AGREEMENT_START_DATE: '',
  AGREEMENT_END_DATE: '',
  NO_OF_USER: '',
  TRAIL_PERIOD: '',
  BILLING_CYCLE: '',
  Bill_START_DATE: '',
  BILL_AFTER_DAYS: '',
  BILL_UNSUBSCRIPTION_DATE: '',
  PRODUCT_TITLE: '',
  BILLING_LETTER_HEAD: '',
  BILLING_LETTER_BODY: '',
  BILLING_LETTER_FOOTER: '',
  BILLING_AMOUNT: '',
  AUTO_MAIL_DATE: '',
  MODULE_TAKEN: [],
  SUBSCRIPTION_STATUS: '',
  REMARKS: '',
  STATUS: '1',
}

export const createInitialSalesAgreementValues = () => ({
  ...initialSalesAgreementValues,
  MODULE_TAKEN: [],
})

function clean(value) {
  return String(value ?? '').trim()
}

function requireValue(errors, values, key, label) {
  if (!values[key]) errors[key] = `${label} is required.`
}

function validatePositiveNumber(errors, values, key, label, integer = false) {
  if (!values[key]) {
    errors[key] = `${label} is required.`
    return
  }

  const numericValue = Number(values[key])
  if (!Number.isFinite(numericValue) || numericValue <= 0 || (integer && !Number.isInteger(numericValue))) {
    errors[key] = integer
      ? `${label} must be a whole number greater than 0.`
      : `${label} must be greater than 0.`
  }
}

export function validateSalesAgreement(values) {
  const normalizedValues = {
    ...values,
    BU_ID: clean(values.BU_ID),
    AGREEMENT_NO: clean(values.AGREEMENT_NO),
    AGREEMENT_DATE: clean(values.AGREEMENT_DATE),
    CUSTOMER: clean(values.CUSTOMER),
    SALES_PERSON_ID: clean(values.SALES_PERSON_ID),
    AGREEMENT_START_DATE: clean(values.AGREEMENT_START_DATE),
    AGREEMENT_END_DATE: clean(values.AGREEMENT_END_DATE),
    NO_OF_USER: clean(values.NO_OF_USER),
    TRAIL_PERIOD: clean(values.TRAIL_PERIOD),
    BILLING_CYCLE: clean(values.BILLING_CYCLE),
    Bill_START_DATE: clean(values.Bill_START_DATE),
    BILL_AFTER_DAYS: clean(values.BILL_AFTER_DAYS),
    BILL_UNSUBSCRIPTION_DATE: clean(values.BILL_UNSUBSCRIPTION_DATE),
    PRODUCT_TITLE: clean(values.PRODUCT_TITLE),
    BILLING_LETTER_HEAD: clean(values.BILLING_LETTER_HEAD),
    BILLING_LETTER_BODY: clean(values.BILLING_LETTER_BODY),
    BILLING_LETTER_FOOTER: clean(values.BILLING_LETTER_FOOTER),
    BILLING_AMOUNT: clean(values.BILLING_AMOUNT),
    AUTO_MAIL_DATE: clean(values.AUTO_MAIL_DATE),
    MODULE_TAKEN: Array.isArray(values.MODULE_TAKEN) ? values.MODULE_TAKEN : [],
    SUBSCRIPTION_STATUS: clean(values.SUBSCRIPTION_STATUS),
    REMARKS: clean(values.REMARKS),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  requireValue(errors, normalizedValues, 'BU_ID', 'Business Unit')
  requireValue(errors, normalizedValues, 'AGREEMENT_NO', 'Agreement No.')
  requireValue(errors, normalizedValues, 'AGREEMENT_DATE', 'Agreement Date')
  requireValue(errors, normalizedValues, 'SALES_PERSON_ID', 'Sales Person')
  requireValue(errors, normalizedValues, 'AGREEMENT_START_DATE', 'Agreement Start Date')
  requireValue(errors, normalizedValues, 'AGREEMENT_END_DATE', 'Agreement End Date')
  requireValue(errors, normalizedValues, 'Bill_START_DATE', 'Bill Start Date')
  requireValue(errors, normalizedValues, 'BILL_AFTER_DAYS', 'Billing After')
  requireValue(errors, normalizedValues, 'BILL_UNSUBSCRIPTION_DATE', 'Bill Unsubscription Date')
  requireValue(errors, normalizedValues, 'PRODUCT_TITLE', 'Product Title')
  requireValue(errors, normalizedValues, 'SUBSCRIPTION_STATUS', 'Subscription Status')

  if (!normalizedValues.CUSTOMER) {
    errors.CUSTOMER = 'Customer Contact Person is required.'
  } else if (normalizedValues.CUSTOMER.length < 2) {
    errors.CUSTOMER = 'Customer Contact Person must be at least 2 characters.'
  } else if (normalizedValues.CUSTOMER.length > 20) {
    errors.CUSTOMER = 'Customer Contact Person must not exceed 20 characters.'
  }

  validatePositiveNumber(errors, normalizedValues, 'NO_OF_USER', 'No. of Users', true)
  validatePositiveNumber(errors, normalizedValues, 'BILLING_AMOUNT', 'Billing Amount')

  if (normalizedValues.TRAIL_PERIOD) {
    const trialDays = Number(normalizedValues.TRAIL_PERIOD)
    if (!Number.isInteger(trialDays) || trialDays <= 0) {
      errors.TRAIL_PERIOD = 'Trial Period must be a whole number greater than 0.'
    }
  }

  if (
    normalizedValues.AGREEMENT_START_DATE &&
    normalizedValues.AGREEMENT_END_DATE &&
    normalizedValues.AGREEMENT_END_DATE < normalizedValues.AGREEMENT_START_DATE
  ) {
    errors.AGREEMENT_END_DATE = 'Agreement End Date must be on or after Agreement Start Date.'
  }

  if (
    normalizedValues.Bill_START_DATE &&
    normalizedValues.BILL_UNSUBSCRIPTION_DATE &&
    normalizedValues.BILL_UNSUBSCRIPTION_DATE < normalizedValues.Bill_START_DATE
  ) {
    errors.BILL_UNSUBSCRIPTION_DATE = 'Bill Unsubscription Date must be on or after Bill Start Date.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
