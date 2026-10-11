/** @file ASSET_RECEIVE_REGISTER defaults, calculations, and validation. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_RECEIVE_REGISTER_TABLE = 'ASSET_RECEIVE_REGISTER'
export const ASSET_RECEIVE_SPEC_TABLE = 'ASSET_ITEM_SPEC'

export function todayIso() {
  return formatIsoDate(new Date())
}

export function createInitialAssetReceiveValues(numbers) {
  return {
    GRN_NO: numbers.GRN_NO,
    GRN_DATE: todayIso(),
    PURCHASE_DATE: todayIso(),
    RECEIVED_BY_ID: '',
    RECEIVED_BY_NAME: '',
    PURCHASE_THROUGH: '',
    ITEM_NAME: '',
    ITEM_NAME_LABEL: '',
    ITEM_GROUP: '',
    PO_NO: '',
    SUPPLIER_ID: '',
    SUPPLIER_NAME: '',
    UOM: '',
    UOM_NAME: '',
    CURRENCY: 'BDT',
    ASSET_NO: numbers.ASSET_NO,
    QTY: '1',
    UNIT_PRICE: '',
    GROSS_AMOUNT: '0.00',
    DISCOUNT: '',
    VAT_TAX: '',
    OTHER_CHARGES: '',
    CAPITALIZED_COST: '0.00',
    IS_W_G_APPLICABLE: 'NA',
    W_G_PERIOD: '',
    W_G_START_DATE: '',
    W_G_END_DATE: '',
    W_G_OTHER_INFO: '',
    CUSTODIAN_ID: '',
    CUSTODIAN_NAME: '',
    SUB_CUSTODIAN_ID: '',
    SUB_CUSTODIAN_NAME: '',
    LOCATION: '',
    LOCATION_NAME: '',
    BUILDING: '',
    FLOOR: '',
    ROOM: '',
    RAC: '',
    BIN: '',
    DEPRI_METHOD: '',
    DEPRI_LIFE: '',
    DEPRI_PERCENTAGE: '',
    DEPRI_START_DATE: '',
    DEPRI_END_DATE: '',
    REMARKS: '',
    STATUS: '1',
    SPECIFICATIONS: [],
  }
}

function numericValue(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

export function calculateReceiveAmounts(values) {
  const gross = numericValue(values.QTY) * numericValue(values.UNIT_PRICE)
  const total = gross
    - numericValue(values.DISCOUNT)
    + numericValue(values.VAT_TAX)
    + numericValue(values.OTHER_CHARGES)
  return {
    GROSS_AMOUNT: Math.max(0, gross).toFixed(2),
    CAPITALIZED_COST: Math.max(0, total).toFixed(2),
  }
}

export function calculateDepreciationEndDate(startDate, months) {
  const parsed = parseIsoDate(startDate)
  const life = Number(months)
  if (!parsed || !Number.isInteger(life) || life < 1) return ''
  parsed.setMonth(parsed.getMonth() + life)
  return formatIsoDate(parsed)
}

function required(errors, values, key, label) {
  if (!String(values[key] ?? '').trim()) errors[key] = `${label} is required.`
}

export function validateAssetReceive(values, existingRecords = [], references = {}) {
  const normalized = {
    ...values,
    GRN_NO: String(values.GRN_NO ?? '').trim(),
    ASSET_NO: String(values.ASSET_NO ?? '').trim(),
    PO_NO: String(values.PO_NO ?? '').trim(),
    W_G_OTHER_INFO: String(values.W_G_OTHER_INFO ?? '').trim(),
    RAC: String(values.RAC ?? '').trim(),
    BIN: String(values.BIN ?? '').trim(),
    REMARKS: String(values.REMARKS ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
    SPECIFICATIONS: (values.SPECIFICATIONS ?? []).map((row) => ({
      ...row,
      EQUIPMENT_VALUE: String(row.EQUIPMENT_VALUE ?? '').trim(),
    })),
  }
  Object.assign(normalized, calculateReceiveAmounts(normalized))
  normalized.DEPRI_END_DATE = calculateDepreciationEndDate(
    normalized.DEPRI_START_DATE,
    normalized.DEPRI_LIFE,
  )
  const errors = {}

  for (const [key, label] of [
    ['GRN_NO', 'Receive No (GRN)'], ['GRN_DATE', 'Receive Date'],
    ['PURCHASE_DATE', 'Purchase Date'],
    ['RECEIVED_BY_ID', 'Received By'], ['PURCHASE_THROUGH', 'Purchase Through'],
    ['ITEM_NAME', 'Asset Item Name'], ['ITEM_GROUP', 'Item Group'],
    ['SUPPLIER_ID', 'Vendor / Supplier'], ['UOM', 'UOM'], ['CURRENCY', 'Currency'],
    ['ASSET_NO', 'Asset Number'], ['QTY', 'Qty'], ['UNIT_PRICE', 'Unit Price'],
    ['CUSTODIAN_ID', 'Custodian'], ['SUB_CUSTODIAN_ID', 'Sub Custodian'],
    ['LOCATION', 'Location'], ['DEPRI_METHOD', 'Depreciation Method'],
    ['DEPRI_LIFE', 'Depreciation Period'], ['DEPRI_PERCENTAGE', 'Depreciation Percentage'],
    ['DEPRI_START_DATE', 'Depreciation Start Date'], ['DEPRI_END_DATE', 'Depreciation End Date'],
  ]) required(errors, normalized, key, label)

  if (existingRecords.some((record) => record.GRN_NO.toLowerCase() === normalized.GRN_NO.toLowerCase())) {
    errors.GRN_NO = 'Receive No (GRN) must be unique.'
  }
  if (existingRecords.some((record) => record.ASSET_NO.toLowerCase() === normalized.ASSET_NO.toLowerCase())) {
    errors.ASSET_NO = 'Asset Number must be unique.'
  }

  const receiveDate = parseIsoDate(normalized.GRN_DATE)
  if (normalized.GRN_DATE && (!receiveDate || receiveDate > new Date())) {
    errors.GRN_DATE = 'Receive Date must be a valid date and cannot be in the future.'
  }
  const purchaseDate = parseIsoDate(normalized.PURCHASE_DATE)
  if (normalized.PURCHASE_DATE && (!purchaseDate || purchaseDate > new Date())) {
    errors.PURCHASE_DATE = 'Purchase Date must be a valid date and cannot be in the future.'
  } else if (purchaseDate && receiveDate && purchaseDate > receiveDate) {
    errors.PURCHASE_DATE = 'Purchase Date cannot be later than Receive Date.'
  }
  if (normalized.PURCHASE_THROUGH === 'PURCHASE_ORDER' && !normalized.PO_NO) {
    errors.PO_NO = 'PO No is required for Purchase Order receipts.'
  }

  if (!references.assetItems?.some((record) => record.ID === normalized.ITEM_NAME)) {
    errors.ITEM_NAME = errors.ITEM_NAME || 'Select a valid active Asset Item.'
  }
  if (!references.vendors?.some((record) => record.ID === normalized.SUPPLIER_ID)) {
    errors.SUPPLIER_ID = errors.SUPPLIER_ID || 'Select a valid active Vendor / Supplier.'
  }
  if (!references.employees?.some((record) => record.value === normalized.RECEIVED_BY_ID)) {
    errors.RECEIVED_BY_ID = errors.RECEIVED_BY_ID || 'Select a valid employee.'
  }

  if (!/^[1-9]\d*$/.test(String(normalized.QTY))) {
    errors.QTY = 'Qty must be a positive whole number.'
  }
  for (const [key, label] of [
    ['UNIT_PRICE', 'Unit Price'], ['DISCOUNT', 'Discount'],
    ['VAT_TAX', 'VAT/Tax'], ['OTHER_CHARGES', 'Other Charges'],
  ]) {
    const raw = String(normalized[key] ?? '').trim()
    if (key === 'UNIT_PRICE' && raw === '') continue
    if (raw && (!/^\d+(?:\.\d{1,2})?$/.test(raw) || Number(raw) < 0)) {
      errors[key] = `${label} must be a non-negative amount with up to 2 decimal places.`
    }
  }
  if (numericValue(normalized.DISCOUNT) > numericValue(normalized.GROSS_AMOUNT)) {
    errors.DISCOUNT = 'Discount cannot exceed Gross Amount.'
  }

  const warrantyApplicable = normalized.IS_W_G_APPLICABLE !== 'NA'
  if (!normalized.IS_W_G_APPLICABLE) errors.IS_W_G_APPLICABLE = 'Warranty / Guaranty selection is required.'
  if (warrantyApplicable) {
    if (!/^[1-9]\d*$/.test(String(normalized.W_G_PERIOD))) {
      errors.W_G_PERIOD = 'Period/Time must be a positive whole number.'
    }
    required(errors, normalized, 'W_G_START_DATE', 'Start Date')
    required(errors, normalized, 'W_G_END_DATE', 'End Date')
    const start = parseIsoDate(normalized.W_G_START_DATE)
    const end = parseIsoDate(normalized.W_G_END_DATE)
    if (start && end && end < start) errors.W_G_END_DATE = 'End Date cannot be earlier than Start Date.'
  }
  if (normalized.W_G_OTHER_INFO.length > 500) errors.W_G_OTHER_INFO = 'Warranty / Guaranty Other Info must not exceed 500 characters.'

  const custodian = references.custodians?.find((record) => record.ID === normalized.CUSTODIAN_ID)
  if (!custodian) errors.CUSTODIAN_ID = errors.CUSTODIAN_ID || 'Select a valid active Custodian.'
  if (!custodian?.SUB_CUSTODIANS.some((record) => record.ID === normalized.SUB_CUSTODIAN_ID && record.STATUS === '1')) {
    errors.SUB_CUSTODIAN_ID = errors.SUB_CUSTODIAN_ID || 'Select a valid Sub Custodian.'
  }
  if (!references.locations?.some((record) => (
    record.ID === normalized.LOCATION
    && record.CUSTODIAN_ID === normalized.CUSTODIAN_ID
    && record.SUB_CUSTODIAN_ID === normalized.SUB_CUSTODIAN_ID
  ))) errors.LOCATION = errors.LOCATION || 'Select a valid Location for the chosen Custodian.'

  if (!/^[1-9]\d*$/.test(String(normalized.DEPRI_LIFE))) errors.DEPRI_LIFE = 'Depreciation Period must be a positive whole number.'
  const percentage = Number(normalized.DEPRI_PERCENTAGE)
  if (!(percentage > 0 && percentage <= 100)) errors.DEPRI_PERCENTAGE = 'Depreciation Percentage must be greater than 0 and not exceed 100.'
  if (normalized.REMARKS.length > 500) errors.REMARKS = 'Remarks must not exceed 500 characters.'

  const specificationErrors = {}
  normalized.SPECIFICATIONS.forEach((row) => {
    if (!row.EQUIPMENT_VALUE) specificationErrors[row.SPECIFICATION_ID] = `${row.EQUIPMENT_NAME} is required.`
  })
  if (Object.keys(specificationErrors).length) errors.SPECIFICATIONS = specificationErrors

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
