/**
 * @file Validation rules and constants for Supplier Information (AFM_SUPPLIER_INFO).
 */

export const SUPPLIER_TYPE_OPTIONS = [
  'Manufacturer',
  'Wholesaler',
  'Distributor',
  'Retailer',
  'Service Provider',
  'Importer',
  'Trader',
  'Contractor',
  'Other',
]

export const BUSINESS_TYPE_OPTIONS = [
  'Proprietorship',
  'Partnership',
  'Private Limited',
  'Public Limited',
  'Government',
  'NGO / Non-Profit',
  'Other',
]

export const PAYMENT_TERMS_OPTIONS = [
  'Cash on Delivery',
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

export const initialSupplierValues = {
  BG_ID: '',
  BU_ID: '',
  SUPPLIER_CODE: '',
  SUPPLIER_NAME: '',
  SUPPLIER_TYPE: '',
  BUSINESS_TYPE: '',
  CONTACT_PERSON: '',
  DESIGNATION: '',
  PHONE: '',
  ALTERNATE_PHONE: '',
  EMAIL: '',
  WEBSITE: '',
  COUNTRY_ID: '',
  DIVISION: '',
  DISTRICT: '',
  ADDRESS: '',
  POSTAL_CODE: '',
  TAX_REGISTRATION_NO: '',
  TIN_NUMBER: '',
  TRADE_LICENSE_NO: '',
  BANK_NAME: '',
  BANK_BRANCH: '',
  BANK_ACCOUNT_NAME: '',
  BANK_ACCOUNT_NO: '',
  ROUTING_NUMBER: '',
  PAYMENT_TERMS: '',
  CREDIT_LIMIT: '0.00',
  CREDIT_DAYS: '0',
  CURRENCY_CODE: 'BDT',
  OPENING_BALANCE: '0.00',
  BALANCE_TYPE: '',
  REMARKS: '',
  STATUS: '1',
}

/**
 * Validates Supplier form data.
 * @param {object} values Form values
 * @returns {object} Form errors mapped by field name
 */
export function validateSupplier(values = {}) {
  const errors = {}

  if (!values.SUPPLIER_NAME || !String(values.SUPPLIER_NAME).trim()) {
    errors.SUPPLIER_NAME = 'Supplier Name is required'
  } else if (String(values.SUPPLIER_NAME).trim().length > 150) {
    errors.SUPPLIER_NAME = 'Supplier Name cannot exceed 150 characters'
  }

  if (!values.SUPPLIER_TYPE || !String(values.SUPPLIER_TYPE).trim()) {
    errors.SUPPLIER_TYPE = 'Supplier Type is required'
  }

  if (values.PHONE && String(values.PHONE).trim().length > 50) {
    errors.PHONE = 'Phone number cannot exceed 50 characters'
  }

  if (values.ADDRESS && String(values.ADDRESS).trim().length > 500) {
    errors.ADDRESS = 'Full Address cannot exceed 500 characters'
  }

  if (values.EMAIL && String(values.EMAIL).trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(String(values.EMAIL).trim())) {
      errors.EMAIL = 'Please enter a valid email address'
    }
  }

  if (values.CREDIT_LIMIT && isNaN(Number(values.CREDIT_LIMIT))) {
    errors.CREDIT_LIMIT = 'Credit Limit must be a number'
  }

  if (values.OPENING_BALANCE && isNaN(Number(values.OPENING_BALANCE))) {
    errors.OPENING_BALANCE = 'Opening Balance must be a number'
  }

  if (values.CREDIT_DAYS && isNaN(Number(values.CREDIT_DAYS))) {
    errors.CREDIT_DAYS = 'Credit Days must be an integer'
  }

  return errors
}

