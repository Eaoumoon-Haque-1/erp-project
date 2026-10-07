/** @file ASSET_DISPOSAL defaults and workbook validation rules. */
import { parseIsoDate } from '../../../../utils/dateFormat.js'
import { calculateDisposalFinancials, todayIso } from '../data/assetDisposalCalculations.js'

export const ASSET_DISPOSAL_TABLE = 'ASSET_DISPOSAL'

export function createInitialAssetDisposalValues() {
  return {
    ASSET_RECORD_ID: '', ASSET_SOURCE: '', ASSET_RECEIVE_ID: '', ASSET_NO: '', ITEM_NAME: '', ITEM_NAME_LABEL: '',
    PURCHASE_DATE: '', PURCHASE_PRICE: '0.00', GL_DATE: '', DEPRI_START_DATE: '', DEPRI_END_DATE: '',
    DEPRI_PERCENTAGE: '', DEPRI_LIFE: '', TOTAL_DEPRECIATION_VALUE: '0.00', WRITTEN_DOWN_VALUE: '0.00',
    DISPOSAL_DATE: todayIso(), DISPOSAL_TYPE: '', DISPOSAL_TYPE_NAME: '', DISPOSAL_VALUE: '0.00',
    GAIN_ON_DISPOSAL: '0.00', LOSS_ON_DISPOSAL: '0.00', APPROVED_BY: '', APPROVED_BY_NAME: '',
    REASON: '', REASON_NAME: '', REMARK: '', DISPOSAL_STATUS: 'DRAFT', STATUS: '1',
  }
}

export function validateAssetDisposal(values, existingRecords = [], references = {}) {
  const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value ?? '').trim()]))
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'
  Object.assign(normalized, calculateDisposalFinancials(normalized))
  const errors = {}
  const selectedAsset = references.eligibleAssets?.find((option) => option.value === normalized.ASSET_RECORD_ID)

  if (!normalized.ASSET_RECORD_ID) errors.ASSET_RECORD_ID = 'Asset Item Name and ID is required.'
  else if (!selectedAsset) errors.ASSET_RECORD_ID = 'Select a valid Asset eligible for disposal.'

  const purchaseDate = parseIsoDate(normalized.PURCHASE_DATE)
  const glDate = parseIsoDate(normalized.GL_DATE)
  const depreciationStartDate = parseIsoDate(normalized.DEPRI_START_DATE)
  const depreciationEndDate = parseIsoDate(normalized.DEPRI_END_DATE)
  if (!purchaseDate) errors.PURCHASE_DATE = 'A valid Purchase Date is unavailable for this Asset.'
  if (!glDate) errors.GL_DATE = 'A valid GL Date is unavailable for this Asset.'
  if (!depreciationStartDate) errors.DEPRI_START_DATE = 'A valid Depreciation Start Date is unavailable for this Asset.'
  if (!depreciationEndDate) errors.DEPRI_END_DATE = 'A valid Depreciation End Date is unavailable for this Asset.'
  else if (depreciationStartDate && depreciationEndDate < depreciationStartDate) errors.DEPRI_END_DATE = 'Depreciation End Date cannot be earlier than its Start Date.'
  if (Number(normalized.PURCHASE_PRICE) < 0) errors.PURCHASE_PRICE = 'Purchase Price cannot be negative.'

  const disposalDate = parseIsoDate(normalized.DISPOSAL_DATE)
  if (!normalized.DISPOSAL_DATE) errors.DISPOSAL_DATE = 'Disposal Date is required.'
  else if (!disposalDate) errors.DISPOSAL_DATE = 'Enter a valid Disposal Date.'
  else if ([purchaseDate, glDate, depreciationStartDate].filter(Boolean).some((date) => disposalDate < date)) errors.DISPOSAL_DATE = 'Disposal Date cannot be earlier than the Purchase, GL, or Depreciation Start Date.'

  if (!normalized.DISPOSAL_TYPE) errors.DISPOSAL_TYPE = 'Disposal Type is required.'
  else if (!references.disposalTypes?.some((option) => option.value === normalized.DISPOSAL_TYPE)) errors.DISPOSAL_TYPE = 'Select a valid Disposal Type.'

  if (normalized.DISPOSAL_VALUE === '') errors.DISPOSAL_VALUE = 'Disposal Value is required.'
  else if (!/^\d+(\.\d{1,2})?$/.test(normalized.DISPOSAL_VALUE)) errors.DISPOSAL_VALUE = 'Enter a valid non-negative Disposal Value with up to 2 decimal places.'
  else normalized.DISPOSAL_VALUE = Number(normalized.DISPOSAL_VALUE).toFixed(2)

  if (!normalized.REASON) errors.REASON = 'Reason is required.'
  else if (!references.reasons?.some((option) => option.value === normalized.REASON)) errors.REASON = 'Select a valid disposal Reason.'

  if (!normalized.DISPOSAL_STATUS) errors.DISPOSAL_STATUS = 'Disposal Status is required.'
  else if (!references.statuses?.some((option) => option.value === normalized.DISPOSAL_STATUS)) errors.DISPOSAL_STATUS = 'Select a valid Disposal Status.'

  if (['APPROVED', 'COMPLETED'].includes(normalized.DISPOSAL_STATUS)) {
    if (!normalized.APPROVED_BY) errors.APPROVED_BY = 'Approved By is required before approval or completion.'
    else if (!references.approvers?.some((record) => record.value === normalized.APPROVED_BY)) errors.APPROVED_BY = 'Select a valid authorized Approver.'
  }

  const disposalTypeLabel = references.disposalTypes?.find((option) => option.value === normalized.DISPOSAL_TYPE)?.label.toLowerCase() || ''
  const reasonLabel = references.reasons?.find((option) => option.value === normalized.REASON)?.label.toLowerCase() || ''
  const remarksRequired = ['lost', 'damaged', 'write-off', 'write off', 'beyond repair'].some((term) => disposalTypeLabel.includes(term) || reasonLabel.includes(term))
  if (remarksRequired && !normalized.REMARK) errors.REMARK = 'Remarks are required for the selected disposal type or reason.'
  else if (normalized.REMARK.length > 500) errors.REMARK = 'Remarks must not exceed 500 characters.'

  if (existingRecords.some((record) => record.STATUS === '1' && record.ASSET_RECORD_ID === normalized.ASSET_RECORD_ID)) errors.ASSET_RECORD_ID = 'This Asset already has an active disposal record.'

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
