/**
 * @file Form schema, initial values, constants, and validation rules for Voucher and Payment Type Mapping.
 */

export const AFM_V_TYPE_P_TYPE_MAP_TABLE = 'AFM_V_TYPE_P_TYPE_MAP'

export const initialVoucherMappingValues = {
  BG_ID: '',
  BU_ID: '',
  VOUCHER_TYPE_ID: '',
  PAYMENT_TYPE_ID: '',
  STATUS: '1',
}

/**
 * Validates Voucher Type and Payment Type mapping fields.
 * @param {object} values Form values
 * @param {Array} [existingMappings=[]] Existing mappings for duplicate checking
 * @param {string|number|null} [currentId=null] Currently editing mapping ID
 * @returns {{ isValid: boolean, values: object, errors: object }}
 */
export function validateVoucherTypeMapping(
  values = {},
  existingMappings = [],
  currentId = null,
) {
  const errors = {}

  const normalizedValues = {
    ...values,
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    VOUCHER_TYPE_ID: String(values.VOUCHER_TYPE_ID ?? '').trim(),
    PAYMENT_TYPE_ID: String(values.PAYMENT_TYPE_ID ?? '').trim(),
    STATUS: String(values.STATUS ?? '1'),
  }

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.VOUCHER_TYPE_ID) {
    errors.VOUCHER_TYPE_ID = 'Voucher Type is required.'
  }

  if (!normalizedValues.PAYMENT_TYPE_ID) {
    errors.PAYMENT_TYPE_ID = 'Payment Type is required.'
  }

  // Duplicate check across existing mappings for this Business Unit
  if (
    normalizedValues.BU_ID &&
    normalizedValues.VOUCHER_TYPE_ID &&
    normalizedValues.PAYMENT_TYPE_ID &&
    !errors.PAYMENT_TYPE_ID
  ) {
    const isDuplicate = existingMappings.some(
      (m) =>
        String(m.id || m.ID) !== String(currentId) &&
        String(m.buId || m.BU_ID) === normalizedValues.BU_ID &&
        String(m.voucherTypeId || m.VOUCHER_TYPE_ID) ===
          normalizedValues.VOUCHER_TYPE_ID &&
        String(m.paymentTypeId || m.PAYMENT_TYPE_ID) ===
          normalizedValues.PAYMENT_TYPE_ID,
    )

    if (isDuplicate) {
      errors.PAYMENT_TYPE_ID =
        'This Voucher Type and Payment Type mapping already exists for the selected Business Unit.'
    }
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    values: normalizedValues,
    errors,
  }
}
