/** @file ASSET_GATE_PASS and ASSET_GATE_PASS_DTLS defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_GATE_PASS_TABLE = 'ASSET_GATE_PASS'
export const ASSET_GATE_PASS_DETAIL_TABLE = 'ASSET_GATE_PASS_DTLS'

export function createInitialGatePassValues(gatePassNo = '') {
  return {
    GATE_PASS_DATE: formatIsoDate(new Date()),
    GATE_PASS_NO: gatePassNo,
    SUPPLIER_ID: '',
    SUPPLIER_NAME: '',
    CUSTODIAN: '',
    CUSTODIAN_NAME: '',
    REMARK: '',
    STATUS: '1',
  }
}

export const initialGatePassItemValues = {
  ITEM_NAME: '',
  ITEM_NAME_LABEL: '',
  QUANTITY: '',
}

function normalize(value) {
  return String(value ?? '').trim()
}

export function validateGatePassItem(values, rows = [], references = {}) {
  const normalized = {
    ITEM_NAME: normalize(values.ITEM_NAME),
    ITEM_NAME_LABEL: normalize(values.ITEM_NAME_LABEL),
    QUANTITY: normalize(values.QUANTITY),
  }
  const errors = {}
  const selectedItem = references.assetItems?.find((record) => record.ID === normalized.ITEM_NAME)

  if (!normalized.ITEM_NAME) errors.ITEM_NAME = 'Asset Item Name and ID is required.'
  else if (!selectedItem) errors.ITEM_NAME = 'Select a valid active Asset Item.'
  else if (rows.some((row) => row.ITEM_NAME === normalized.ITEM_NAME)) errors.ITEM_NAME = 'This Asset Item has already been added.'

  if (!normalized.QUANTITY) errors.QUANTITY = 'Quantity is required.'
  else if (!/^\d+$/.test(normalized.QUANTITY) || Number(normalized.QUANTITY) < 1) errors.QUANTITY = 'Quantity must be a positive whole number.'

  if (selectedItem) normalized.ITEM_NAME_LABEL = selectedItem.ITEM_NAME
  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}

export function validateGatePass(values, rows, existingRecords = [], references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, normalize(value)]))
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  const errors = {}

  if (!normalized.GATE_PASS_DATE) errors.GATE_PASS_DATE = 'Gate Pass Date is required.'
  else if (!parseIsoDate(normalized.GATE_PASS_DATE)) errors.GATE_PASS_DATE = 'Enter a valid Gate Pass Date.'

  if (!normalized.GATE_PASS_NO) errors.GATE_PASS_NO = 'Gate Pass No is required.'
  else if (normalized.GATE_PASS_NO.length > 30) errors.GATE_PASS_NO = 'Gate Pass No must not exceed 30 characters.'
  else if (existingRecords.some((record) => normalize(record.GATE_PASS_NO).toLowerCase() === normalized.GATE_PASS_NO.toLowerCase())) errors.GATE_PASS_NO = 'This Gate Pass No already exists.'

  const supplier = references.vendors?.find((record) => record.ID === normalized.SUPPLIER_ID)
  if (!normalized.SUPPLIER_ID) errors.SUPPLIER_ID = 'Supplier is required.'
  else if (!supplier) errors.SUPPLIER_ID = 'Select a valid active Supplier.'
  else normalized.SUPPLIER_NAME = supplier.VENDOR_NAME

  const custodian = references.custodians?.find((record) => record.ID === normalized.CUSTODIAN)
  if (!normalized.CUSTODIAN) errors.CUSTODIAN = 'Custodian is required.'
  else if (!custodian) errors.CUSTODIAN = 'Select a valid active Custodian.'
  else normalized.CUSTODIAN_NAME = custodian.CUSTODIAN_NAME

  if (!Array.isArray(rows) || rows.length === 0) errors.ITEMS = 'Add at least one Asset Item.'
  if (normalized.REMARK.length > 500) errors.REMARK = 'Remarks must not exceed 500 characters.'

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
