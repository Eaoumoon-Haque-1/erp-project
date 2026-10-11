/**
 * @file ASSET_RECEIVE_REGISTER defaults and client validation for the API-backed
 * page (the older assetReceiveRegisterValidation.js still serves the Bulk page).
 * Mirrors backend rules; the backend remains the source of truth.
 * Ids needed to build the request stay required even when RELAX_REQUIRED is on.
 */
import { isRequired } from '../../../../config/devFlags'
import { formatIsoDate } from '../../../../utils/dateFormat'
import { receiveBusinessGroup } from '../data/assetReceiveScope'

export const ASSET_RECEIVE_TABLE = 'ASSET_RECEIVE_REGISTER'

export const createInitialAssetReceiveValues = () => ({
  BG_ID: receiveBusinessGroup.ID,
  BU_ID: '',
  GRN_NO: '',
  GRN_DATE: '',
  PURCHASE_DATE: '',
  PURCHASE_THROUGH: '',
  // TODO: replace with an employee dropdown when the employee API exists.
  RECEIVED_BY_ID: '',
  SUPPLIER_ID: '',
  ITEM_NAME_ID: '',
  ASSET_NO: '',
  REQ_NO: '',
  PO_NO: '',
  QTY: '',
  UOM_ID: '',
  UNIT_PRICE: '',
  DISCOUNT: '0',
  VAT_TAX: '0',
  OTHER_CHARGES: '0',
  CURRENCY_ID: '',
  WG_APPLICABLE: 'N/A',
  WG_PERIOD: '',
  WG_TYPE_ID: '',
  WG_START_DATE: '',
  WG_END_DATE: '',
  WG_OTHER_INFO: '',
  CUSTODIAN_ID: '',
  SUB_CUSTODIAN_ID: '',
  LOCATION_ID: '',
  RAC: '',
  BIN: '',
  DEPRI_CATEGORY_ID: '',
  DEPRI_METHOD_ID: '',
  ASSET_TYPE_ID: '',
  DEPRI_LIFE: '',
  DEPRI_PERCENTAGE: '',
  ASSET_OWNER_ID: '',
  REMARKS: '',
  STATUS: '1',
})

export const WARRANTY_FIELDS = ['WG_PERIOD', 'WG_TYPE_ID', 'WG_START_DATE', 'WG_END_DATE', 'WG_OTHER_INFO']

const REQUIRED_IDS = [
  ['BU_ID', 'Business Unit'],
  ['RECEIVED_BY_ID', 'Received By'],
  ['SUPPLIER_ID', 'Supplier'],
  ['ITEM_NAME_ID', 'Asset Item'],
  ['UOM_ID', 'UOM'],
  ['CURRENCY_ID', 'Currency'],
  ['CUSTODIAN_ID', 'Custodian'],
  ['SUB_CUSTODIAN_ID', 'Sub Custodian'],
  ['LOCATION_ID', 'Location'],
  ['DEPRI_CATEGORY_ID', 'Depreciation Category'],
  ['DEPRI_METHOD_ID', 'Depreciation Method'],
  ['ASSET_TYPE_ID', 'Asset Type'],
  ['ASSET_OWNER_ID', 'Asset Owner'],
]

const OPTIONAL_TEXT = [
  ['PURCHASE_THROUGH', 'Purchase Through', 50],
  ['ASSET_NO', 'Asset No', 50],
  ['REQ_NO', 'Req No', 50],
  ['PO_NO', 'PO No', 50],
  ['RAC', 'RAC', 50],
  ['BIN', 'Bin', 50],
  ['WG_OTHER_INFO', 'Warranty/Guaranty Other Info', 255],
  ['REMARKS', 'Remarks', 500],
]

const INTEGER = /^\d+$/
const DECIMAL = /^\d+(\.\d+)?$/

export const calculateAmounts = (values) => {
  const number = (value) => (DECIMAL.test(String(value ?? '').trim()) ? Number(value) : 0)
  const gross = number(values.QTY) * number(values.UNIT_PRICE)
  return {
    gross,
    capitalized: gross - number(values.DISCOUNT) + number(values.VAT_TAX) + number(values.OTHER_CHARGES),
  }
}

export function validateSpecRows(rows) {
  const specRows = {}
  const normalizedRows = rows.map((row) => ({
    ...row,
    EQUIPMENT_NAME: String(row.EQUIPMENT_NAME ?? '').trim(),
    EQUIPMENT_VALUE: String(row.EQUIPMENT_VALUE ?? '').trim(),
    STATUS: String(row.STATUS) === '0' ? '0' : '1',
  }))

  normalizedRows.forEach((row, index) => {
    const rowErrors = {}
    if (!row.EQUIPMENT_NAME) {
      if (isRequired()) rowErrors.EQUIPMENT_NAME = 'Equipment Name is required.'
    } else if (row.EQUIPMENT_NAME.length > 50) {
      rowErrors.EQUIPMENT_NAME = 'Equipment Name must not exceed 50 characters.'
    } else if (normalizedRows.some((other, otherIndex) => (
      otherIndex !== index && other.EQUIPMENT_NAME.toLowerCase() === row.EQUIPMENT_NAME.toLowerCase()
    ))) {
      rowErrors.EQUIPMENT_NAME = 'This Equipment Name is duplicated.'
    }
    if (!row.EQUIPMENT_VALUE) {
      if (isRequired()) rowErrors.EQUIPMENT_VALUE = 'Equipment Value is required.'
    } else if (row.EQUIPMENT_VALUE.length > 100) {
      rowErrors.EQUIPMENT_VALUE = 'Equipment Value must not exceed 100 characters.'
    }
    if (Object.keys(rowErrors).length > 0) specRows[row._ROW_ID] = rowErrors
  })

  return { rows: normalizedRows, specRows, isValid: Object.keys(specRows).length === 0 }
}

export function validateAssetReceive(values, rows) {
  const normalized = { ...values, STATUS: String(values.STATUS) === '0' ? '0' : '1' }
  const errors = {}
  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === 'string') normalized[key] = normalized[key].trim()
  })
  const warrantyOn = normalized.WG_APPLICABLE !== 'N/A'

  // Ids are required: they are needed to build a valid request.
  REQUIRED_IDS.forEach(([key, label]) => {
    if (!normalized[key]) errors[key] = `${label} is required.`
  })
  if (!errors.RECEIVED_BY_ID && !/^[1-9]\d*$/.test(normalized.RECEIVED_BY_ID)) {
    errors.RECEIVED_BY_ID = 'Received By must be a valid Employee ID.'
  }
  if (warrantyOn && !normalized.WG_TYPE_ID) errors.WG_TYPE_ID = 'Warranty/Guaranty Type is required.'

  // Dates (RELAX_REQUIRED: empty is allowed; rules run only when entered).
  const today = formatIsoDate(new Date())
  if (!normalized.GRN_DATE) {
    if (isRequired()) errors.GRN_DATE = 'Receive Date is required.'
  } else if (normalized.GRN_DATE > today) {
    errors.GRN_DATE = 'Receive Date cannot be in the future.'
  }
  if (normalized.PURCHASE_DATE) {
    if (normalized.PURCHASE_DATE > today) errors.PURCHASE_DATE = 'Purchase Date cannot be in the future.'
    else if (normalized.GRN_DATE && normalized.PURCHASE_DATE > normalized.GRN_DATE) {
      errors.PURCHASE_DATE = 'Purchase Date cannot be after Receive Date.'
    }
  }

  OPTIONAL_TEXT.forEach(([key, label, max]) => {
    if (normalized[key].length > max) errors[key] = `${label} must not exceed ${max} characters.`
  })

  // Numbers: [key, label, pattern, patternMessage, check(value) -> message|'']
  const numberRules = [
    ['QTY', 'Qty', INTEGER, 'Qty must be a whole number.', (n) => (n < 1 ? 'Qty must be at least 1.' : ''), true],
    ['UNIT_PRICE', 'Unit Price', DECIMAL, 'Unit Price must be 0 or more.', () => '', true],
    ['DISCOUNT', 'Discount', DECIMAL, 'Discount must be 0 or more.', () => '', false],
    ['VAT_TAX', 'VAT/Tax', DECIMAL, 'VAT/Tax must be 0 or more.', () => '', false],
    ['OTHER_CHARGES', 'Other Charges', DECIMAL, 'Other Charges must be 0 or more.', () => '', false],
    ['DEPRI_LIFE', 'Depreciation Period', INTEGER, 'Depreciation Period must be a whole number.',
      (n) => (n < 1 || n > 1200 ? 'Depreciation Period must be between 1 and 1200.' : ''), true],
    ['DEPRI_PERCENTAGE', 'Depreciation Percentage', DECIMAL, 'Depreciation Percentage must be a number.',
      (n) => (n <= 0 || n > 100 ? 'Depreciation Percentage must be above 0 and at most 100.' : ''), true],
    ['WG_PERIOD', 'Warranty/Guaranty Period', INTEGER, 'Period must be a whole number.',
      (n) => (n < 1 ? 'Period must be at least 1.' : ''), false],
  ]
  numberRules.forEach(([key, label, pattern, patternMessage, check, required]) => {
    if (key === 'WG_PERIOD' && !warrantyOn) return
    const value = normalized[key]
    if (!value) {
      const mustFill = required || (key === 'WG_PERIOD' && warrantyOn)
      if (mustFill && isRequired()) errors[key] = `${label} is required.`
    } else if (!pattern.test(value)) {
      errors[key] = patternMessage
    } else {
      const message = check(Number(value))
      if (message) errors[key] = message
    }
  })

  if (!errors.DISCOUNT && calculateAmounts(normalized).gross < Number(normalized.DISCOUNT || 0)) {
    errors.DISCOUNT = 'Discount cannot exceed Gross Amount.'
  }

  // Warranty/Guaranty dates are required only when it applies (relaxed by the flag).
  if (warrantyOn) {
    ;[['WG_START_DATE', 'Start Date'], ['WG_END_DATE', 'End Date']].forEach(([key, label]) => {
      if (!normalized[key] && isRequired()) errors[key] = `${label} is required.`
    })
    if (normalized.WG_START_DATE && normalized.WG_END_DATE && normalized.WG_END_DATE < normalized.WG_START_DATE) {
      errors.WG_END_DATE = 'End Date cannot be before Start Date.'
    }
  }

  const rowResult = validateSpecRows(rows)
  if (!rowResult.isValid) errors.specRows = rowResult.specRows

  return { values: normalized, rows: rowResult.rows, errors, isValid: Object.keys(errors).length === 0 }
}
