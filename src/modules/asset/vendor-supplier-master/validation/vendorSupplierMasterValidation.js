/**
 * @file INV_SUPPLIER defaults and client validation (mirrors backend rules; the
 * backend remains the source of truth, including uniqueness per Business Unit).
 * Returned `values` are normalized: trimmed, phone without spaces/hyphens,
 * email lowercase.
 */
import { isRequired } from '../../../../config/devFlags'
import { supplierBusinessGroup } from '../data/vendorSupplierMasterScope'

export const SUPPLIER_TABLE = 'INV_SUPPLIER'

export const createInitialSupplierValues = () => ({
  BG_ID: supplierBusinessGroup.ID,
  BU_ID: '',
  SUPPLIER_NAME: '',
  SUPPLIER_CODE: '',
  CONTACT_PERSON: '',
  PHONE: '',
  EMAIL: '',
  ADDRESS: '',
  COMPANY_TYPE: '',
  TAX_ID: '',
  STATUS: '1',
})

const PHONE_PATTERN = /^\+?[0-9]{7,15}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// [key, label, min, max, pattern, patternMessage, required]
const TEXT_RULES = [
  ['SUPPLIER_NAME', 'Supplier Name', 2, 150, null, '', true],
  ['SUPPLIER_CODE', 'Supplier Code', 2, 30, /^[A-Za-z0-9_-]+$/,
    'Supplier Code allows only letters, digits, hyphen and underscore.', true],
  ['CONTACT_PERSON', 'Contact Person', 2, 100, /^[A-Za-z .'-]+$/,
    'Contact Person allows only letters, spaces, dots, apostrophes and hyphens.', true],
  ['PHONE', 'Phone', 7, 16, PHONE_PATTERN,
    'Phone must have 7-15 digits and may start with +.', true],
  ['EMAIL', 'Email', 5, 150, EMAIL_PATTERN, 'Enter a valid Email.', true],
  ['ADDRESS', 'Address', 5, 255, null, '', true],
  ['TAX_ID', 'Tax ID / BIN', 5, 50, /^[A-Za-z0-9-]+$/,
    'Tax ID / BIN allows only letters, digits and hyphen.', true],
  ['COMPANY_TYPE', 'Company Type', 0, 50, null, '', false],
]

function normalizeValue(key, raw) {
  const value = String(raw ?? '').trim()
  if (key === 'PHONE') return value.replace(/[\s-]/g, '')
  if (key === 'EMAIL') return value.toLowerCase()
  return value
}

export function validateSupplier(values) {
  const normalized = { ...values, STATUS: String(values.STATUS) === '0' ? '0' : '1' }
  const errors = {}

  // Business Unit is always required: buId is needed to build the request.
  if (!String(normalized.BU_ID ?? '')) errors.BU_ID = 'Business Unit is required.'

  TEXT_RULES.forEach(([key, label, min, max, pattern, patternMessage, required]) => {
    const value = normalizeValue(key, normalized[key])
    normalized[key] = value
    if (!value) {
      // RELAX_REQUIRED: empty values are allowed; format/length checks run only when entered.
      if (required && isRequired()) errors[key] = `${label} is required.`
    } else if (value.length < min) {
      errors[key] = key === 'PHONE' ? patternMessage : `${label} must be at least ${min} characters.`
    } else if (value.length > max) {
      errors[key] = key === 'PHONE' ? patternMessage : `${label} must not exceed ${max} characters.`
    } else if (pattern && !pattern.test(value)) {
      errors[key] = patternMessage
    }
  })

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
