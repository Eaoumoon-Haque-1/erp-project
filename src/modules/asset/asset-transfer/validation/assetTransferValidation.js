/** @file ASSET_TRANSFER defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_TRANSFER_TABLE = 'ASSET_TRANSFER'

export function createInitialAssetTransferValues() {
  return {
    ASSET_ASSIGNMENT_ID: '', ASSET_RECORD_ID: '', ASSET_NO: '', ITEM_NAME: '', ITEM_NAME_LABEL: '',
    FROM_CUSTODIAN_ID: '', FROM_CUSTODIAN_NAME: '', FROM_SUB_CUSTODIAN_ID: '', FROM_SUB_CUSTODIAN_NAME: '',
    FROM_DEPARTMENT_ID: '', FROM_DEPARTMENT_NAME: '', FROM_LOCATION: '', FROM_LOCATION_NAME: '',
    FROM_BUILDING: '', FROM_FLOOR: '', FROM_ROOM: '', FROM_ASSIGN_DATE: '',
    FROM_CONDITION_ON_ISSUE: '', FROM_REMARKS: '',
    TO_CUSTODIAN_ID: '', TO_CUSTODIAN_NAME: '', TO_SUB_CUSTODIAN_ID: '', TO_SUB_CUSTODIAN_NAME: '',
    TO_DEPARTMENT_ID: '', TO_DEPARTMENT_NAME: '', TO_LOCATION: '', TO_LOCATION_NAME: '',
    TO_BUILDING: '', TO_FLOOR: '', TO_ROOM: '', TO_ASSIGN_DATE: formatIsoDate(new Date()),
    TO_CONDITION_ON_ISSUE: '', TO_REMARKS: '', STATUS: '1',
  }
}

export function validateAssetTransfer(values, references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]))
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  const errors = {}
  const selectedAsset = references.transferableAssets?.find((option) => option.value === normalized.ASSET_ASSIGNMENT_ID)

  if (!normalized.ASSET_ASSIGNMENT_ID) errors.ASSET_ASSIGNMENT_ID = 'Asset Item Name and ID is required.'
  else if (!selectedAsset) errors.ASSET_ASSIGNMENT_ID = 'Select a valid currently assigned Asset.'

  const requiredFrom = [
    ['FROM_CUSTODIAN_ID', 'From Custodian'], ['FROM_SUB_CUSTODIAN_ID', 'From Sub Custodian'],
    ['FROM_DEPARTMENT_ID', 'From Department'], ['FROM_LOCATION', 'From Location'],
    ['FROM_ASSIGN_DATE', 'From Assign Date'], ['FROM_CONDITION_ON_ISSUE', 'From Condition on Issue'],
  ]
  requiredFrom.forEach(([key, label]) => { if (!normalized[key]) errors[key] = `${label} is unavailable for the selected Asset.` })

  const custodian = references.custodians?.find((record) => record.ID === normalized.TO_CUSTODIAN_ID)
  if (!normalized.TO_CUSTODIAN_ID) errors.TO_CUSTODIAN_ID = 'To Custodian is required.'
  else if (!custodian) errors.TO_CUSTODIAN_ID = 'Select a valid active To Custodian.'
  if (!normalized.TO_SUB_CUSTODIAN_ID) errors.TO_SUB_CUSTODIAN_ID = 'To Sub Custodian is required.'
  else if (!custodian?.SUB_CUSTODIANS.some((record) => record.ID === normalized.TO_SUB_CUSTODIAN_ID && record.STATUS === '1')) errors.TO_SUB_CUSTODIAN_ID = 'Select a valid Sub Custodian for the To Custodian.'

  if (!normalized.TO_DEPARTMENT_ID) errors.TO_DEPARTMENT_ID = 'To Department is required.'
  else if (!references.departments?.some((option) => option.value === normalized.TO_DEPARTMENT_ID)) errors.TO_DEPARTMENT_ID = 'Select a valid active To Department.'

  const location = references.locations?.find((record) => record.ID === normalized.TO_LOCATION)
  if (!normalized.TO_LOCATION) errors.TO_LOCATION = 'To Location is required.'
  else if (!location || location.CUSTODIAN_ID !== normalized.TO_CUSTODIAN_ID || location.SUB_CUSTODIAN_ID !== normalized.TO_SUB_CUSTODIAN_ID) errors.TO_LOCATION = 'Select a valid Location for the chosen Custodian and Sub Custodian.'

  const fromDate = parseIsoDate(normalized.FROM_ASSIGN_DATE)
  const toDate = parseIsoDate(normalized.TO_ASSIGN_DATE)
  if (!normalized.TO_ASSIGN_DATE) errors.TO_ASSIGN_DATE = 'To Assign Date is required.'
  else if (!toDate) errors.TO_ASSIGN_DATE = 'Enter a valid To Assign Date.'
  else if (fromDate && toDate < fromDate) errors.TO_ASSIGN_DATE = 'To Assign Date cannot be earlier than From Assign Date.'

  if (!normalized.TO_CONDITION_ON_ISSUE) errors.TO_CONDITION_ON_ISSUE = 'To Condition on Issue is required.'
  else if (!references.conditions?.some((option) => option.value === normalized.TO_CONDITION_ON_ISSUE)) errors.TO_CONDITION_ON_ISSUE = 'Select a valid To Condition on Issue.'

  const exceptionalCondition = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(normalized.TO_CONDITION_ON_ISSUE)
  if (exceptionalCondition && !normalized.TO_REMARKS) errors.TO_REMARKS = 'To Remarks are required for the selected condition.'
  else if (normalized.TO_REMARKS.length > 500) errors.TO_REMARKS = 'To Remarks must not exceed 500 characters.'

  const transferChanged = [
    ['FROM_CUSTODIAN_ID', 'TO_CUSTODIAN_ID'], ['FROM_SUB_CUSTODIAN_ID', 'TO_SUB_CUSTODIAN_ID'],
    ['FROM_DEPARTMENT_ID', 'TO_DEPARTMENT_ID'], ['FROM_LOCATION', 'TO_LOCATION'],
    ['FROM_CONDITION_ON_ISSUE', 'TO_CONDITION_ON_ISSUE'],
  ].some(([fromKey, toKey]) => normalized[fromKey] !== normalized[toKey])
  if (!transferChanged && normalized.ASSET_ASSIGNMENT_ID) errors.TO_LOCATION = 'Change at least one destination or condition value before saving.'

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
