/** @file Validation rules and initial form values for Asset Audit. */
import { parseIsoDate } from '../../../../utils/dateFormat'

export const ASSET_AUDIT_TABLE = 'ASSET_AUDIT'

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function createInitialAssetAuditValues() {
  return {
    ASSET_RECORD_ID: '',
    ITEM_NAME_LABEL: '',
    DISPOSAL_DATE: todayIso(),
    DISPOSAL_TYPE: '',
    DISPOSAL_TYPE_NAME: '',
    DISPOSAL_VALUE: '0.00',
    WRITTEN_DOWN_VALUE: '0.00',
    GAIN_ON_DISPOSAL: '0.00',
    LOSS_ON_DISPOSAL: '0.00',
    APPROVED_BY: '',
    APPROVED_BY_NAME: '',
    REASON: '',
    REASON_NAME: '',
    REMARK: '',
    DISPOSAL_STATUS: 'DRAFT',
    STATUS: '1',
  }
}

export function validateAssetAudit(values, references = {}) {
  const normalized = Object.fromEntries(
    Object.entries(values || {}).map(([key, val]) => [key, String(val ?? '').trim()]),
  )
  normalized.STATUS = normalized.STATUS === '0' ? '0' : '1'

  const errors = {}

  if (!normalized.ASSET_RECORD_ID) {
    errors.ASSET_RECORD_ID = 'Asset Item is required.'
  } else if (
    references.assetItems?.length > 0 &&
    !references.assetItems.some((item) => String(item.id) === normalized.ASSET_RECORD_ID)
  ) {
    errors.ASSET_RECORD_ID = 'Select a valid Asset Item.'
  }

  const disposalDate = parseIsoDate(normalized.DISPOSAL_DATE)
  if (!normalized.DISPOSAL_DATE) {
    errors.DISPOSAL_DATE = 'Disposal Date is required.'
  } else if (!disposalDate) {
    errors.DISPOSAL_DATE = 'Enter a valid Disposal Date.'
  }

  if (!normalized.DISPOSAL_TYPE) {
    errors.DISPOSAL_TYPE = 'Disposal Type is required.'
  }

  if (normalized.DISPOSAL_VALUE === '') {
    errors.DISPOSAL_VALUE = 'Disposal Value is required.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(normalized.DISPOSAL_VALUE)) {
    errors.DISPOSAL_VALUE = 'Enter a valid non-negative Disposal Value with up to 2 decimal places.'
  } else {
    normalized.DISPOSAL_VALUE = Number(normalized.DISPOSAL_VALUE).toFixed(2)
  }

  if (normalized.WRITTEN_DOWN_VALUE && !/^\d+(\.\d{1,2})?$/.test(normalized.WRITTEN_DOWN_VALUE)) {
    errors.WRITTEN_DOWN_VALUE = 'Enter a valid Written Down Value.'
  } else if (normalized.WRITTEN_DOWN_VALUE) {
    normalized.WRITTEN_DOWN_VALUE = Number(normalized.WRITTEN_DOWN_VALUE).toFixed(2)
  }

  if (!normalized.DISPOSAL_STATUS) {
    errors.DISPOSAL_STATUS = 'Disposal Status is required.'
  }

  if (['APPROVED', 'COMPLETED'].includes(normalized.DISPOSAL_STATUS)) {
    if (!normalized.APPROVED_BY) {
      errors.APPROVED_BY = 'Approved By is required before approval or completion.'
    } else if (
      references.approvers?.length > 0 &&
      !references.approvers.some((emp) => String(emp.id) === normalized.APPROVED_BY)
    ) {
      errors.APPROVED_BY = 'Select a valid Approver.'
    }
  }

  if (normalized.REMARK && normalized.REMARK.length > 500) {
    errors.REMARK = 'Remarks must not exceed 500 characters.'
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
