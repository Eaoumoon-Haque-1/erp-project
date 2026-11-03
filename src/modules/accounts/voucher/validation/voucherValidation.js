/**
 * @file Validation schema and constants for Account Voucher.
 */

export const VOUCHER_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

export const POSTED_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

export const RECONCILED_OPTIONS = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

export const AC_SOURCE_OPTIONS = [
  { value: 'General Ledger', label: 'General Ledger' },
  { value: 'Sub Ledger', label: 'Sub Ledger' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Employee', label: 'Employee' },
]

export const initialVoucherValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  VOUCHER_DATE: new Date().toISOString().slice(0, 10),
  VOUCHER_TYPE_ID: '',
  VOUCHER_TYPE: '',
  VOUCHER_NO: '',
  LOCATION_ID: '',
  PAYMENT_TYPE_ID: '',
  PAYMENT_TYPE: '',
  PAYMENT_TO: '',
  PAYMENT_THROUGH_ID: '',
  PAYMENT_THROUGH: '',
  PERIOD_NAME: '',
  VOUCHER_AMOUNT: '0.00',
  VOUCHER_SOURCE: 'MANUAL',
  VOUCHER_SOURCE_LINK: '',
  VOUCHER_STATUS: 'DRAFT',
  APPROVAL_CODE: '',
  BANK_ACCOUNT: '',
  CHEQUE_NO: '',
  CHEQUE_DATE: new Date().toISOString().slice(0, 10),
  CHEQUE_AMOUNT: '',
  IS_POSTED: '0',
  IS_RECONCILED: '0',
  NARRATION: '',
  STATUS: '1',
}

export function createInitialDetailRow() {
  return {
    id: null,
    coaId: '',
    coaSourceName: '',
    coaSourceId: '',
    costCenterId: '',
    drAmount: '',
    crAmount: '',
  }
}

export function createInitialAttachmentRow() {
  return {
    id: null,
    attachmentFileName: '',
    attachmentFile: '',
    isActive: 1,
  }
}

/**
 * Validates voucher master and detail lines.
 * @param {object} values Master form values
 * @param {Array} details Detail lines
 * @param {Array} attachments Attachment items
 * @returns {{isValid: boolean, errors: object, detailErrors: Array, totalDr: number, totalCr: number, isBalanced: boolean}}
 */
export function validateVoucher(values, details = [], attachments = []) {
  const errors = {}
  const detailErrors = []
  void attachments

  // Master field validations
  if (!values.VOUCHER_DATE) {
    errors.VOUCHER_DATE = 'Voucher Date is required'
  }

  if (!values.VOUCHER_TYPE_ID && !values.VOUCHER_TYPE) {
    errors.VOUCHER_TYPE_ID = 'Voucher Type is required'
  }

  if (!values.VOUCHER_NO || !String(values.VOUCHER_NO).trim()) {
    errors.VOUCHER_NO = 'Voucher No. is required'
  }

  if (!values.PERIOD_NAME || !String(values.PERIOD_NAME).trim()) {
    errors.PERIOD_NAME = 'Period Name is required'
  }

  if (values.NARRATION && values.NARRATION.length > 200) {
    errors.NARRATION = `Narration cannot exceed 200 characters (currently ${values.NARRATION.length})`
  }

  // Detail lines validation
  if (!details || details.length === 0) {
    errors.DETAILS = 'At least one voucher detail line is required'
  } else {
    details.forEach((row, index) => {
      const rowErr = {}
      if (!row.coaId) {
        rowErr.coaId = 'Account Name is required'
      }

      const dr = parseFloat(row.drAmount) || 0
      const cr = parseFloat(row.crAmount) || 0

      if (dr <= 0 && cr <= 0) {
        rowErr.amount = 'Either DR Amount or CR Amount must be greater than 0'
      } else if (dr > 0 && cr > 0) {
        rowErr.amount = 'Row cannot have both DR and CR amounts'
      }

      if (Object.keys(rowErr).length > 0) {
        detailErrors[index] = rowErr
      }
    })
  }

  // Calculate totals
  const totalDr = details.reduce((sum, row) => sum + (parseFloat(row.drAmount) || 0), 0)
  const totalCr = details.reduce((sum, row) => sum + (parseFloat(row.crAmount) || 0), 0)
  const isBalanced = Math.abs(totalDr - totalCr) < 0.001

  const hasMasterErrors = Object.keys(errors).length > 0
  const hasDetailErrors = detailErrors.some((e) => e && Object.keys(e).length > 0)

  return {
    isValid: !hasMasterErrors && !hasDetailErrors,
    errors,
    detailErrors,
    totalDr: Number(totalDr.toFixed(2)),
    totalCr: Number(totalCr.toFixed(2)),
    isBalanced,
  }
}
