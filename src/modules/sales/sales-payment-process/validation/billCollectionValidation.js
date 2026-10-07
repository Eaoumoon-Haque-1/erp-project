/**
 * @file Backend-facing data contract and client validation for Sales Payment Process.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const BILL_COLLECTION_TABLE = 'HR_BILL_COLLECTION_INFO'

export const paymentMethodOptions = [
  { value: 'BANK', label: 'Bank' },
  { value: 'MFS', label: 'MFS' },
  { value: 'ONLINE_PAYMENT', label: 'Online Payment' },
  { value: 'OTHER', label: 'Other' },
]

export function createInitialBillCollectionValues(payment = {}) {
  return {
    BU_ID: String(payment.BU_ID ?? ''),
    AGREEMENT_ID: String(payment.AGRIMENT_ID ?? ''),
    AGREEMENT_NO: String(payment.AGREEMENT_NO ?? ''),
    BILL_AMOUNT: String(payment.TOTAL_PAYABLE ?? payment.BILLING_AMOUNT ?? ''),
    PAYMENT_METHOD: '',
    IS_BILL_COLLECTED: '1',
    REMARKS: '',
  }
}

export function validateBillCollection(values) {
  const normalizedValues = {
    BU_ID: String(values.BU_ID ?? '').trim(),
    AGREEMENT_ID: String(values.AGREEMENT_ID ?? '').trim(),
    AGREEMENT_NO: String(values.AGREEMENT_NO ?? '').trim(),
    BILL_AMOUNT: String(values.BILL_AMOUNT ?? '').trim(),
    PAYMENT_METHOD: String(values.PAYMENT_METHOD ?? '').trim(),
    IS_BILL_COLLECTED: String(values.IS_BILL_COLLECTED) === '1' ? '1' : '0',
    REMARKS: String(values.REMARKS ?? '').trim(),
  }
  const errors = {}

  if (!normalizedValues.BU_ID) errors.BU_ID = 'Business Unit is required.'
  if (!normalizedValues.AGREEMENT_ID) errors.AGREEMENT_ID = 'Agreement No. is required.'

  const billAmount = Number(normalizedValues.BILL_AMOUNT)
  if (!normalizedValues.BILL_AMOUNT) {
    errors.BILL_AMOUNT = 'Billing Amount is required.'
  } else if (!Number.isFinite(billAmount) || billAmount <= 0) {
    errors.BILL_AMOUNT = 'Billing Amount must be greater than 0.'
  }

  if (!normalizedValues.PAYMENT_METHOD) {
    errors.PAYMENT_METHOD = 'Payment Method is required.'
  }

  if (normalizedValues.REMARKS.length > 500) {
    errors.REMARKS = 'Remarks must not exceed 500 characters.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
