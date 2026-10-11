/** @file ASSET_VENDOR defaults and workbook validation rules. */
export const ASSET_VENDOR_TABLE = 'ASSET_VENDOR'

export const initialVendorSupplierValues = {
  VENDOR_NAME: '',
  VENDOR_CODE: '',
  CONTACT_PERSON: '',
  PHONE: '',
  EMAIL: '',
  COMPANY_TYPE: '',
  ADDRESS: '',
  TAX_ID: '',
  STATUS: '1',
}

function text(value) {
  return String(value ?? '').trim()
}

function matchesExisting(records, key, value) {
  const normalizedValue = text(value).toLowerCase()
  return records.some((record) => text(record[key]).toLowerCase() === normalizedValue)
}

export function validateVendorSupplier(values, existingRecords = []) {
  const normalized = {
    VENDOR_NAME: text(values.VENDOR_NAME),
    VENDOR_CODE: text(values.VENDOR_CODE),
    CONTACT_PERSON: text(values.CONTACT_PERSON),
    PHONE: text(values.PHONE).replace(/\s+/g, ' '),
    EMAIL: text(values.EMAIL).toLowerCase(),
    COMPANY_TYPE: text(values.COMPANY_TYPE),
    ADDRESS: text(values.ADDRESS),
    TAX_ID: text(values.TAX_ID),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalized.VENDOR_NAME) {
    errors.VENDOR_NAME = 'Supplier Name is required.'
  } else if (normalized.VENDOR_NAME.length < 2) {
    errors.VENDOR_NAME = 'Supplier Name must be at least 2 characters.'
  } else if (normalized.VENDOR_NAME.length > 150) {
    errors.VENDOR_NAME = 'Supplier Name must not exceed 150 characters.'
  } else if (matchesExisting(existingRecords, 'VENDOR_NAME', normalized.VENDOR_NAME)) {
    errors.VENDOR_NAME = 'This Supplier Name already exists.'
  }

  if (!normalized.VENDOR_CODE) {
    errors.VENDOR_CODE = 'Supplier Code is required.'
  } else if (normalized.VENDOR_CODE.length < 2) {
    errors.VENDOR_CODE = 'Supplier Code must be at least 2 characters.'
  } else if (normalized.VENDOR_CODE.length > 30) {
    errors.VENDOR_CODE = 'Supplier Code must not exceed 30 characters.'
  } else if (!/^[A-Za-z0-9_-]+$/.test(normalized.VENDOR_CODE)) {
    errors.VENDOR_CODE = 'Use only letters, numbers, hyphens, and underscores.'
  } else if (matchesExisting(existingRecords, 'VENDOR_CODE', normalized.VENDOR_CODE)) {
    errors.VENDOR_CODE = 'This Supplier Code already exists.'
  }

  if (!normalized.CONTACT_PERSON) {
    errors.CONTACT_PERSON = 'Contact Person is required.'
  } else if (normalized.CONTACT_PERSON.length < 2) {
    errors.CONTACT_PERSON = 'Contact Person must be at least 2 characters.'
  } else if (normalized.CONTACT_PERSON.length > 100) {
    errors.CONTACT_PERSON = 'Contact Person must not exceed 100 characters.'
  }

  if (!normalized.PHONE) {
    errors.PHONE = 'Phone is required.'
  } else if (normalized.PHONE.length > 20) {
    errors.PHONE = 'Phone must not exceed 20 characters.'
  } else if (!/^\+?[0-9][0-9\s()-]{5,18}[0-9]$/.test(normalized.PHONE)) {
    errors.PHONE = 'Enter a valid phone number.'
  }

  if (!normalized.EMAIL) {
    errors.EMAIL = 'Email is required.'
  } else if (normalized.EMAIL.length > 150) {
    errors.EMAIL = 'Email must not exceed 150 characters.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.EMAIL)) {
    errors.EMAIL = 'Enter a valid email address.'
  }

  if (!normalized.ADDRESS) {
    errors.ADDRESS = 'Address is required.'
  } else if (normalized.ADDRESS.length < 5) {
    errors.ADDRESS = 'Address must be at least 5 characters.'
  } else if (normalized.ADDRESS.length > 255) {
    errors.ADDRESS = 'Address must not exceed 255 characters.'
  }

  if (normalized.COMPANY_TYPE.length > 100) {
    errors.COMPANY_TYPE = 'Company Type must not exceed 100 characters.'
  }

  if (!normalized.TAX_ID) {
    errors.TAX_ID = 'Tax ID / BIN is required.'
  } else if (normalized.TAX_ID.length > 50) {
    errors.TAX_ID = 'Tax ID / BIN must not exceed 50 characters.'
  } else if (!/^[A-Za-z0-9/_ -]+$/.test(normalized.TAX_ID)) {
    errors.TAX_ID = 'Tax ID / BIN contains invalid characters.'
  } else if (matchesExisting(existingRecords, 'TAX_ID', normalized.TAX_ID)) {
    errors.TAX_ID = 'This Tax ID / BIN already exists.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
