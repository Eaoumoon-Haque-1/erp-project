/** @file ASSET_MAINTENANCE defaults and workbook validation rules. */
import { parseIsoDate } from '../../../../utils/dateFormat'
import { maintenanceTypeRules } from '../data/maintenanceAmcOptions'

export const ASSET_MAINTENANCE_TABLE = 'ASSET_MAINTENANCE'

export const initialMaintenanceAmcValues = {
  ITEM_NAME: '',
  ITEM_NAME_LABEL: '',
  MAINTENANCE_TYPE: '',
  MAINTENANCE_TYPE_NAME: '',
  MAINTENANCE_PRIORITY: 'MEDIUM',
  VENDOR_ID: '',
  VENDOR_NAME: '',
  START_DATE: '',
  END_DATE: '',
  COST: '',
  NEXT_DUE_DATE: '',
  REMARK: '',
  STATUS: '1',
}

export function validateMaintenanceAmc(values, references = {}) {
  const normalized = {
    ...values,
    ITEM_NAME: String(values.ITEM_NAME ?? '').trim(),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    MAINTENANCE_TYPE: String(values.MAINTENANCE_TYPE ?? '').trim(),
    MAINTENANCE_TYPE_NAME: String(values.MAINTENANCE_TYPE_NAME ?? '').trim(),
    MAINTENANCE_PRIORITY: String(values.MAINTENANCE_PRIORITY ?? 'MEDIUM').trim(),
    VENDOR_ID: String(values.VENDOR_ID ?? '').trim(),
    VENDOR_NAME: String(values.VENDOR_NAME ?? '').trim(),
    START_DATE: String(values.START_DATE ?? '').trim(),
    END_DATE: String(values.END_DATE ?? '').trim(),
    COST: String(values.COST ?? '').trim(),
    NEXT_DUE_DATE: String(values.NEXT_DUE_DATE ?? '').trim(),
    REMARK: String(values.REMARK ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }

  const errors = {}
  const rules = maintenanceTypeRules(normalized.MAINTENANCE_TYPE, references)

  if (!normalized.ITEM_NAME) {
    errors.ITEM_NAME = 'Asset Item is required.'
  }

  if (!normalized.MAINTENANCE_TYPE) {
    errors.MAINTENANCE_TYPE = 'Maintenance Type is required.'
  }

  if (!normalized.VENDOR_ID) {
    errors.VENDOR_ID = 'Vendor is required.'
  }

  const startDate = parseIsoDate(normalized.START_DATE)
  const endDate = parseIsoDate(normalized.END_DATE)
  const nextDueDate = parseIsoDate(normalized.NEXT_DUE_DATE)

  if (!normalized.START_DATE) {
    errors.START_DATE = 'Start Date is required.'
  } else if (!startDate) {
    errors.START_DATE = 'Enter a valid Start Date.'
  }

  if (rules.requiresEndDate && !normalized.END_DATE) {
    errors.END_DATE = 'End Date is required for AMC.'
  } else if (normalized.END_DATE && !endDate) {
    errors.END_DATE = 'Enter a valid End Date.'
  } else if (startDate && endDate && endDate < startDate) {
    errors.END_DATE = 'End Date cannot be earlier than Start Date.'
  }

  if (rules.requiresNextDueDate && !normalized.NEXT_DUE_DATE) {
    errors.NEXT_DUE_DATE = 'Next Due Date is required for this Maintenance Type.'
  } else if (normalized.NEXT_DUE_DATE && !nextDueDate) {
    errors.NEXT_DUE_DATE = 'Enter a valid Next Due Date.'
  } else if (startDate && nextDueDate && nextDueDate < startDate) {
    errors.NEXT_DUE_DATE = 'Next Due Date cannot be earlier than Start Date.'
  }

  if (!normalized.COST) {
    errors.COST = 'Cost is required.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(normalized.COST)) {
    errors.COST = 'Enter a valid non-negative Cost with up to 2 decimal places.'
  } else {
    normalized.COST = Number(normalized.COST).toFixed(2)
  }

  if (normalized.REMARK.length > 500) {
    errors.REMARK = 'Remark must not exceed 500 characters.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
