/** @file ASSET_MAINTENANCE defaults and workbook validation rules. */
import { parseIsoDate } from '../../../../utils/dateFormat.js'
import { maintenanceTypeRules } from '../data/maintenanceAmcOptions.js'

export const ASSET_MAINTENANCE_TABLE = 'ASSET_MAINTENANCE'

export const initialMaintenanceAmcValues = {
  ITEM_NAME: '', ITEM_NAME_LABEL: '', MAINTENANCE_TYPE: '', MAINTENANCE_TYPE_NAME: '',
  VENDOR_ID: '', VENDOR_NAME: '', START_DATE: '', END_DATE: '', COST: '',
  NEXT_DUE_DATE: '', REMARK: '', STATUS: '1',
}

function periodsOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  const leftFinish = leftEnd || leftStart
  const rightFinish = rightEnd || rightStart
  return leftStart <= rightFinish && rightStart <= leftFinish
}

export function validateMaintenanceAmc(values, existingRecords = [], references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]))
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  const errors = {}
  const rules = maintenanceTypeRules(normalized.MAINTENANCE_TYPE, references)

  if (!normalized.ITEM_NAME) errors.ITEM_NAME = 'Asset Item Name and ID is required.'
  else if (!references.assetItems?.some((record) => record.ID === normalized.ITEM_NAME)) errors.ITEM_NAME = 'Select a valid active Asset Item.'

  if (!normalized.MAINTENANCE_TYPE) errors.MAINTENANCE_TYPE = 'Maintenance Type is required.'
  else if (!references.maintenanceTypes?.some((option) => option.value === normalized.MAINTENANCE_TYPE)) errors.MAINTENANCE_TYPE = 'Select a valid Maintenance Type.'

  if (!normalized.VENDOR_ID) errors.VENDOR_ID = 'Vendor is required.'
  else if (!references.vendors?.some((record) => record.ID === normalized.VENDOR_ID)) errors.VENDOR_ID = 'Select a valid active Vendor.'

  const startDate = parseIsoDate(normalized.START_DATE)
  const endDate = parseIsoDate(normalized.END_DATE)
  const nextDueDate = parseIsoDate(normalized.NEXT_DUE_DATE)
  if (!normalized.START_DATE) errors.START_DATE = 'Start Date is required.'
  else if (!startDate) errors.START_DATE = 'Enter a valid Start Date.'

  if (rules.requiresEndDate && !normalized.END_DATE) errors.END_DATE = 'End Date is required for AMC.'
  else if (normalized.END_DATE && !endDate) errors.END_DATE = 'Enter a valid End Date.'
  else if (startDate && endDate && endDate < startDate) errors.END_DATE = 'End Date cannot be earlier than Start Date.'

  if (rules.requiresNextDueDate && !normalized.NEXT_DUE_DATE) errors.NEXT_DUE_DATE = 'Next Due Date is required for this Maintenance Type.'
  else if (normalized.NEXT_DUE_DATE && !nextDueDate) errors.NEXT_DUE_DATE = 'Enter a valid Next Due Date.'
  else if (startDate && nextDueDate && nextDueDate < startDate) errors.NEXT_DUE_DATE = 'Next Due Date cannot be earlier than Start Date.'

  if (!normalized.COST) errors.COST = 'Cost is required.'
  else if (!/^\d+(\.\d{1,2})?$/.test(normalized.COST)) errors.COST = 'Enter a valid non-negative Cost with up to 2 decimal places.'
  else normalized.COST = Number(normalized.COST).toFixed(2)

  if (normalized.REMARK.length > 500) errors.REMARK = 'Remark must not exceed 500 characters.'

  if (startDate && existingRecords.some((record) => (
    record.STATUS === '1'
    && record.ITEM_NAME === normalized.ITEM_NAME
    && periodsOverlap(
      startDate,
      endDate,
      parseIsoDate(record.START_DATE),
      parseIsoDate(record.END_DATE),
    )
  ))) errors.START_DATE = 'An active overlapping maintenance record already exists for this Asset Item.'

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
