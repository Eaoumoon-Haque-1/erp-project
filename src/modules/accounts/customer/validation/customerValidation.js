/**
 * @file Validation rules and constants for Customer Information (AFM_CUSTOMER_INFO).
 */

export const CUSTOMER_TYPE_OPTIONS = [
  'Retail',
  'Wholesale',
  'Corporate',
  'Dealer / Distributor',
  'Government',
  'Export',
  'Online',
  'Other',
]

export const BUSINESS_TYPE_OPTIONS = [
  'Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'Individual',
  'Government',
  'NGO / Non-Profit',
  'Other',
]

export const CUSTOMER_CATEGORY_OPTIONS = [
  { value: '1', label: 'Tier 1 - Platinum' },
  { value: '2', label: 'Tier 2 - Gold' },
  { value: '3', label: 'Tier 3 - Silver' },
  { value: '4', label: 'Standard' },
]

export const PAYMENT_TERMS_OPTIONS = [
  'Immediate / Cash',
  'Due on Receipt',
  'Advance Payment',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
]

export const CURRENCY_OPTIONS = [
  'BDT',
  'USD',
  'EUR',
  'GBP',
  'INR',
  'AED',
  'SAR',
  'CNY',
  'SGD',
]

export const BALANCE_TYPE_OPTIONS = ['Debit', 'Credit']

export const COUNTRY_OPTIONS = [
  { value: '1', label: 'Bangladesh' },
  { value: '2', label: 'India' },
  { value: '3', label: 'China' },
  { value: '4', label: 'United States' },
  { value: '5', label: 'United Kingdom' },
  { value: '6', label: 'Singapore' },
  { value: '7', label: 'Malaysia' },
  { value: '8', label: 'United Arab Emirates' },
  { value: '9', label: 'Other' },
]

export const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const FINANCE_STATUS_OPTIONS = ['Draft', 'Approved']

export const initialCustomerValues = {
  BG_ID: '',
  BU_ID: '',
  CUSTOMER_CODE: '',
  CUSTOMER_NAME: '',
  CUSTOMER_TYPE: '',
  BUSINESS_TYPE: '',
  CUSTOMER_CATEGORY_ID: '',
  CONTACT_PERSON: '',
  DESIGNATION: '',
  PHONE: '',
  ALTERNATE_PHONE: '',
  WHATSAPP_NO: '',
  EMAIL: '',
  WEBSITE: '',
  COUNTRY_ID: '',
  DIVISION: '',
  DISTRICT: '',
  ADDRESS: '',
  POSTAL_CODE: '',
  SHIPPING_ADDRESS: '',
  TAX_REGISTRATION_NO: '',
  TIN_NUMBER: '',
  PAYMENT_TERMS: '',
  CREDIT_LOWER_LIMIT: '0.00',
  CREDIT_UPPER_LIMIT: '0.00',
  CREDIT_DAYS: '0',
  CURRENCY_CODE: 'BDT',
  OPENING_BALANCE: '0.00',
  BALANCE_TYPE: '',
  AGREEMENT_DATE_FROM: '',
  AGREEMENT_DATE_TO: '',
  FINANCE_STATUS: 'Draft',
  REMARKS: '',
  STATUS: '1',
}

/**
 * Validates Customer form data.
 * @param {object} values Form values
 * @returns {object} Form errors mapped by field name
 */
export function validateCustomer(values = {}) {
  const errors = {}

  if (!values.CUSTOMER_CODE || !String(values.CUSTOMER_CODE).trim()) {
    errors.CUSTOMER_CODE = 'Customer Code is required'
  } else if (String(values.CUSTOMER_CODE).trim().length > 50) {
    errors.CUSTOMER_CODE = 'Customer Code cannot exceed 50 characters'
  }

  if (!values.CUSTOMER_NAME || !String(values.CUSTOMER_NAME).trim()) {
    errors.CUSTOMER_NAME = 'Customer Name is required'
  } else if (String(values.CUSTOMER_NAME).trim().length > 150) {
    errors.CUSTOMER_NAME = 'Customer Name cannot exceed 150 characters'
  }

  if (!values.CUSTOMER_TYPE || !String(values.CUSTOMER_TYPE).trim()) {
    errors.CUSTOMER_TYPE = 'Customer Type is required'
  }

  if (values.PHONE && String(values.PHONE).trim().length > 50) {
    errors.PHONE = 'Phone number cannot exceed 50 characters'
  }

  if (values.ADDRESS && String(values.ADDRESS).trim().length > 500) {
    errors.ADDRESS = 'Billing / Full Address cannot exceed 500 characters'
  }

  if (values.EMAIL && String(values.EMAIL).trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(String(values.EMAIL).trim())) {
      errors.EMAIL = 'Please enter a valid email address'
    }
  }

  if (values.CREDIT_LOWER_LIMIT !== undefined && values.CREDIT_LOWER_LIMIT !== '' && isNaN(Number(values.CREDIT_LOWER_LIMIT))) {
    errors.CREDIT_LOWER_LIMIT = 'Credit Lower Limit must be a number'
  }

  if (values.CREDIT_UPPER_LIMIT !== undefined && values.CREDIT_UPPER_LIMIT !== '' && isNaN(Number(values.CREDIT_UPPER_LIMIT))) {
    errors.CREDIT_UPPER_LIMIT = 'Credit Upper Limit must be a number'
  }

  if (
    values.CREDIT_LOWER_LIMIT !== undefined && values.CREDIT_LOWER_LIMIT !== '' &&
    values.CREDIT_UPPER_LIMIT !== undefined && values.CREDIT_UPPER_LIMIT !== '' &&
    !isNaN(Number(values.CREDIT_LOWER_LIMIT)) && !isNaN(Number(values.CREDIT_UPPER_LIMIT)) &&
    Number(values.CREDIT_UPPER_LIMIT) > 0 &&
    Number(values.CREDIT_LOWER_LIMIT) > Number(values.CREDIT_UPPER_LIMIT)
  ) {
    errors.CREDIT_UPPER_LIMIT = 'Credit Upper Limit should be greater than or equal to Lower Limit'
  }

  if (values.OPENING_BALANCE && isNaN(Number(values.OPENING_BALANCE))) {
    errors.OPENING_BALANCE = 'Opening Balance must be a number'
  }

  if (values.CREDIT_DAYS && isNaN(Number(values.CREDIT_DAYS))) {
    errors.CREDIT_DAYS = 'Credit Days must be an integer'
  }

  if (
    values.AGREEMENT_DATE_FROM &&
    values.AGREEMENT_DATE_TO &&
    values.AGREEMENT_DATE_TO < values.AGREEMENT_DATE_FROM
  ) {
    errors.AGREEMENT_DATE_TO = 'Agreement Date (To) must be on or after Agreement Date (From)'
  }

  // When Finance Status is Approved, all Payment & Financial Information fields are strictly mandatory
  if (String(values.FINANCE_STATUS || '').toLowerCase() === 'approved') {
    const finErrors = validateFinancialAgreement(values)
    Object.assign(errors, finErrors)
  }

  return errors
}

export function validateFinancialAgreement(values = {}) {
  const errors = {}

  if (!values.PAYMENT_TERMS || !String(values.PAYMENT_TERMS).trim()) {
    errors.PAYMENT_TERMS = 'Payment Terms is required when Finance Status is Approved'
  }

  if (values.CREDIT_LOWER_LIMIT === undefined || values.CREDIT_LOWER_LIMIT === null || String(values.CREDIT_LOWER_LIMIT).trim() === '') {
    errors.CREDIT_LOWER_LIMIT = 'Credit Lower Limit is required when Finance Status is Approved'
  } else if (isNaN(Number(values.CREDIT_LOWER_LIMIT))) {
    errors.CREDIT_LOWER_LIMIT = 'Credit Lower Limit must be a number'
  }

  if (values.CREDIT_UPPER_LIMIT === undefined || values.CREDIT_UPPER_LIMIT === null || String(values.CREDIT_UPPER_LIMIT).trim() === '') {
    errors.CREDIT_UPPER_LIMIT = 'Credit Upper Limit is required when Finance Status is Approved'
  } else if (isNaN(Number(values.CREDIT_UPPER_LIMIT))) {
    errors.CREDIT_UPPER_LIMIT = 'Credit Upper Limit must be a number'
  }

  if (
    !errors.CREDIT_LOWER_LIMIT &&
    !errors.CREDIT_UPPER_LIMIT &&
    Number(values.CREDIT_LOWER_LIMIT) > Number(values.CREDIT_UPPER_LIMIT)
  ) {
    errors.CREDIT_UPPER_LIMIT = 'Credit Upper Limit must be greater than or equal to Lower Limit'
  }

  if (values.CREDIT_DAYS === undefined || values.CREDIT_DAYS === null || String(values.CREDIT_DAYS).trim() === '') {
    errors.CREDIT_DAYS = 'Credit Days is required when Finance Status is Approved'
  } else if (isNaN(Number(values.CREDIT_DAYS))) {
    errors.CREDIT_DAYS = 'Credit Days must be an integer'
  }

  if (!values.CURRENCY_CODE || !String(values.CURRENCY_CODE).trim()) {
    errors.CURRENCY_CODE = 'Currency is required when Finance Status is Approved'
  }

  if (values.OPENING_BALANCE === undefined || values.OPENING_BALANCE === null || String(values.OPENING_BALANCE).trim() === '') {
    errors.OPENING_BALANCE = 'Opening Balance is required when Finance Status is Approved'
  } else if (isNaN(Number(values.OPENING_BALANCE))) {
    errors.OPENING_BALANCE = 'Opening Balance must be a number'
  }

  if (!values.BALANCE_TYPE || !String(values.BALANCE_TYPE).trim()) {
    errors.BALANCE_TYPE = 'Balance Type is required when Finance Status is Approved'
  }

  if (!values.AGREEMENT_DATE_FROM || !String(values.AGREEMENT_DATE_FROM).trim()) {
    errors.AGREEMENT_DATE_FROM = 'Agreement Date (From) is required when Finance Status is Approved'
  }

  if (!values.AGREEMENT_DATE_TO || !String(values.AGREEMENT_DATE_TO).trim()) {
    errors.AGREEMENT_DATE_TO = 'Agreement Date (To) is required when Finance Status is Approved'
  } else if (
    values.AGREEMENT_DATE_FROM &&
    values.AGREEMENT_DATE_TO < values.AGREEMENT_DATE_FROM
  ) {
    errors.AGREEMENT_DATE_TO = 'Agreement Date (To) must be on or after Agreement Date (From)'
  }

  return errors
}

