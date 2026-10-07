/** @file ASSET_REPAIR defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat.js'

export const ASSET_REPAIR_TABLE = 'ASSET_REPAIR'

export function createInitialAssetRepairValues() {
  return {
    ASSET_RECORD_ID: '', ASSET_SOURCE: '', ASSET_RECEIVE_ID: '', ASSET_NO: '', ITEM_NAME: '', ITEM_NAME_LABEL: '',
    RECEIVE_DATE: formatIsoDate(new Date()), RECEIVE_ID: '', RECEIVE_BY_NAME: '', PROB_SPEC: '',
    SUPPORT_ENGINEER: '', SUPPORT_ENGINEER_NAME: '', START_DATE: '', FINISH_DATE: '', DELIVERY_DATE: '',
    REMARK: '', STATUS: '1',
  }
}

export function validateAssetRepair(values, existingRecords = [], references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]))
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  const errors = {}
  const selectedAsset = references.eligibleAssets?.find((option) => option.value === normalized.ASSET_RECORD_ID)
  if (!normalized.ASSET_RECORD_ID) errors.ASSET_RECORD_ID = 'Asset Item Name and ID is required.'
  else if (!selectedAsset) errors.ASSET_RECORD_ID = 'Select a valid Asset eligible for repair.'

  const receiveDate = parseIsoDate(normalized.RECEIVE_DATE)
  const startDate = parseIsoDate(normalized.START_DATE)
  const finishDate = parseIsoDate(normalized.FINISH_DATE)
  const deliveryDate = parseIsoDate(normalized.DELIVERY_DATE)
  if (!normalized.RECEIVE_DATE) errors.RECEIVE_DATE = 'Receive Date is required.'
  else if (!receiveDate) errors.RECEIVE_DATE = 'Enter a valid Receive Date.'

  if (!normalized.RECEIVE_ID) errors.RECEIVE_ID = 'Receive By is required.'
  else if (!references.vendors?.some((record) => record.ID === normalized.RECEIVE_ID)) errors.RECEIVE_ID = 'Select a valid active Vendor.'

  if (!normalized.PROB_SPEC) errors.PROB_SPEC = 'Problem Specification is required.'
  else if (normalized.PROB_SPEC.length > 1000) errors.PROB_SPEC = 'Problem Specification must not exceed 1,000 characters.'

  if (!normalized.SUPPORT_ENGINEER) errors.SUPPORT_ENGINEER = 'Support Engineer is required.'
  else if (!references.engineers?.some((record) => record.value === normalized.SUPPORT_ENGINEER)) errors.SUPPORT_ENGINEER = 'Select a valid Support Engineer.'

  if (normalized.START_DATE && !startDate) errors.START_DATE = 'Enter a valid Start Date.'
  else if (receiveDate && startDate && startDate < receiveDate) errors.START_DATE = 'Start Date cannot be earlier than Receive Date.'

  if (normalized.FINISH_DATE && !finishDate) errors.FINISH_DATE = 'Enter a valid Finish Date.'
  else if (finishDate && !startDate) errors.START_DATE = 'Start Date is required before Finish Date.'
  else if (finishDate && startDate && finishDate < startDate) errors.FINISH_DATE = 'Finish Date cannot be earlier than Start Date.'

  if (normalized.DELIVERY_DATE && !deliveryDate) errors.DELIVERY_DATE = 'Enter a valid Delivery Date.'
  else if (deliveryDate && !finishDate) errors.FINISH_DATE = 'Finish Date is required before Delivery Date.'
  else if (deliveryDate && receiveDate && deliveryDate < receiveDate) errors.DELIVERY_DATE = 'Delivery Date cannot be earlier than Receive Date.'
  else if (deliveryDate && finishDate && deliveryDate < finishDate) errors.DELIVERY_DATE = 'Delivery Date cannot be earlier than Finish Date.'

  if (normalized.REMARK.length > 500) errors.REMARK = 'Remarks must not exceed 500 characters.'
  if (existingRecords.some((record) => record.STATUS === '1' && !record.DELIVERY_DATE && record.ASSET_RECORD_ID === normalized.ASSET_RECORD_ID)) errors.ASSET_RECORD_ID = 'This Asset already has an open repair record.'

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
