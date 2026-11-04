/** @file ASSET_TRANSFER defaults and workbook validation rules. */
import { formatIsoDate, parseIsoDate } from '../../../../utils/dateFormat'

export const ASSET_TRANSFER_TABLE = 'ASSET_TRANSFER'

export function createInitialAssetTransferValues() {
  return {
    ITEM_ID: '',
    ITEM_NAME_LABEL: '',
    FROM_CUSTODIAN_ID: '',
    FROM_CUSTODIAN_NAME: '',
    FROM_SUB_CUSTODIAN_ID: '',
    FROM_SUB_CUSTODIAN_NAME: '',
    FROM_DEPARTMENT_ID: '',
    FROM_DEPARTMENT_NAME: '',
    FROM_LOCATION: '',
    FROM_LOCATION_NAME: '',
    FROM_BUILDING: '',
    FROM_FLOOR: '',
    FROM_ROOM: '',
    FROM_ASSIGN_DATE: '',
    FROM_CONDITION_ON_ISSUE: '',
    FROM_REMARKS: '',
    TO_CUSTODIAN_ID: '',
    TO_CUSTODIAN_NAME: '',
    TO_SUB_CUSTODIAN_ID: '',
    TO_SUB_CUSTODIAN_NAME: '',
    TO_DEPARTMENT_ID: '',
    TO_DEPARTMENT_NAME: '',
    TO_LOCATION: '',
    TO_LOCATION_NAME: '',
    TO_BUILDING: '',
    TO_FLOOR: '',
    TO_ROOM: '',
    TO_ASSIGN_DATE: formatIsoDate(new Date()),
    TO_CONDITION_ON_ISSUE: '',
    TO_REMARKS: '',
    STATUS: '1',
  }
}

export function validateAssetTransfer(values, references = {}) {
  const normalized = {
    ...values,
    ITEM_ID: String(values.ITEM_ID ?? '').trim(),
    ITEM_NAME_LABEL: String(values.ITEM_NAME_LABEL ?? '').trim(),
    FROM_CUSTODIAN_ID: String(values.FROM_CUSTODIAN_ID ?? '').trim(),
    FROM_SUB_CUSTODIAN_ID: String(values.FROM_SUB_CUSTODIAN_ID ?? '').trim(),
    FROM_DEPARTMENT_ID: String(values.FROM_DEPARTMENT_ID ?? '').trim(),
    FROM_LOCATION: String(values.FROM_LOCATION ?? '').trim(),
    FROM_ASSIGN_DATE: String(values.FROM_ASSIGN_DATE ?? '').trim(),
    FROM_CONDITION_ON_ISSUE: String(values.FROM_CONDITION_ON_ISSUE ?? '').trim(),
    FROM_REMARKS: String(values.FROM_REMARKS ?? '').trim(),
    TO_CUSTODIAN_ID: String(values.TO_CUSTODIAN_ID ?? '').trim(),
    TO_SUB_CUSTODIAN_ID: String(values.TO_SUB_CUSTODIAN_ID ?? '').trim(),
    TO_DEPARTMENT_ID: String(values.TO_DEPARTMENT_ID ?? '').trim(),
    TO_LOCATION: String(values.TO_LOCATION ?? '').trim(),
    TO_ASSIGN_DATE: String(values.TO_ASSIGN_DATE ?? '').trim(),
    TO_CONDITION_ON_ISSUE: String(values.TO_CONDITION_ON_ISSUE ?? '').trim(),
    TO_REMARKS: String(values.TO_REMARKS ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }

  const errors = {}

  if (!normalized.ITEM_ID) {
    errors.ITEM_ID = 'Asset Item is required.'
  }

  const custodian = references.custodians?.find((r) => String(r.id) === normalized.TO_CUSTODIAN_ID)
  if (!normalized.TO_CUSTODIAN_ID) {
    errors.TO_CUSTODIAN_ID = 'To Custodian is required.'
  } else if (!custodian) {
    errors.TO_CUSTODIAN_ID = 'Select a valid active To Custodian.'
  }

  if (!normalized.TO_SUB_CUSTODIAN_ID) {
    errors.TO_SUB_CUSTODIAN_ID = 'To Sub Custodian is required.'
  } else if (
    custodian
    && !(custodian.subCustodians || []).some((s) => String(s.id) === normalized.TO_SUB_CUSTODIAN_ID)
  ) {
    errors.TO_SUB_CUSTODIAN_ID = 'Select a valid Sub Custodian for the chosen Custodian.'
  }

  if (!normalized.TO_DEPARTMENT_ID) {
    errors.TO_DEPARTMENT_ID = 'To Department is required.'
  }

  if (!normalized.TO_LOCATION) {
    errors.TO_LOCATION = 'To Location is required.'
  }

  const fromDate = parseIsoDate(normalized.FROM_ASSIGN_DATE)
  const toDate = parseIsoDate(normalized.TO_ASSIGN_DATE)

  if (!normalized.TO_ASSIGN_DATE) {
    errors.TO_ASSIGN_DATE = 'Transfer Date is required.'
  } else if (!toDate) {
    errors.TO_ASSIGN_DATE = 'Enter a valid Transfer Date.'
  } else if (fromDate && toDate < fromDate) {
    errors.TO_ASSIGN_DATE = 'Transfer Date cannot be earlier than From Assign Date.'
  }

  if (!normalized.TO_CONDITION_ON_ISSUE) {
    errors.TO_CONDITION_ON_ISSUE = 'To Condition on Issue is required.'
  }

  const exceptionalCondition = ['DAMAGED', 'LOST', 'BEYOND_REPAIR'].includes(normalized.TO_CONDITION_ON_ISSUE)
  if (exceptionalCondition && !normalized.TO_REMARKS) {
    errors.TO_REMARKS = 'To Remarks are required for the selected condition.'
  } else if (normalized.TO_REMARKS.length > 500) {
    errors.TO_REMARKS = 'To Remarks must not exceed 500 characters.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
