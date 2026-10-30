/**
 * @file Form schema, initial values, constants, and validation rules for Payment Type and Payment Through Mapping.
 */

export const AFM_P_TYPE_P_THROUGH_MAP_TABLE = 'AFM_P_TYPE_P_THROUGH_MAP'

export const initialMappingValues = {
  BG_ID: '',
  BU_ID: '',
  PAYMENT_TYPE_ID: '',
  PAYMENT_THROUGH_ID: '',
  STATUS: '1',
}

/**
 * Validates Payment Type and Payment Through mapping fields.
 * @param {object} values Form values
 * @param {Array} [existingMappings=[]] Existing mappings for duplicate checking
 * @param {string|number|null} [currentId=null] Currently editing mapping ID
 * @returns {{ isValid: boolean, values: object, errors: object }}
 */
export function validatePaymentTypeMapping(
  values = {},
  existingMappings = [],
  currentId = null,
) {
  const errors = {}

  const normalizedValues = {
    ...values,
    BG_ID: String(values.BG_ID ?? '').trim(),
    BU_ID: String(values.BU_ID ?? '').trim(),
    PAYMENT_TYPE_ID: String(values.PAYMENT_TYPE_ID ?? '').trim(),
    PAYMENT_THROUGH_ID: String(values.PAYMENT_THROUGH_ID ?? '').trim(),
    STATUS: String(values.STATUS ?? '1'),
  }

  if (!normalizedValues.BG_ID) {
    errors.BG_ID = 'Business Group is required.'
  }

  if (!normalizedValues.BU_ID) {
    errors.BU_ID = 'Business Unit is required.'
  }

  if (!normalizedValues.PAYMENT_TYPE_ID) {
    errors.PAYMENT_TYPE_ID = 'Payment Type is required.'
  }

  if (!normalizedValues.PAYMENT_THROUGH_ID) {
    errors.PAYMENT_THROUGH_ID = 'Payment Through is required.'
  }

  // Same value check
  if (
    normalizedValues.PAYMENT_TYPE_ID &&
    normalizedValues.PAYMENT_THROUGH_ID &&
    normalizedValues.PAYMENT_TYPE_ID === normalizedValues.PAYMENT_THROUGH_ID
  ) {
    errors.PAYMENT_THROUGH_ID =
      'Payment Through cannot be the same as Payment Type.'
  }

  // Duplicate check across existing mappings for this Business Unit
  if (
    normalizedValues.BU_ID &&
    normalizedValues.PAYMENT_TYPE_ID &&
    normalizedValues.PAYMENT_THROUGH_ID &&
    !errors.PAYMENT_THROUGH_ID
  ) {
    const isDuplicate = existingMappings.some(
      (m) =>
        String(m.id || m.ID) !== String(currentId) &&
        String(m.buId || m.BU_ID) === normalizedValues.BU_ID &&
        String(m.paymentTypeId || m.PAYMENT_TYPE_ID) ===
          normalizedValues.PAYMENT_TYPE_ID &&
        String(m.paymentThroughId || m.PAYMENT_THROUGH_ID) ===
          normalizedValues.PAYMENT_THROUGH_ID,
    )

    if (isDuplicate) {
      errors.PAYMENT_THROUGH_ID =
        'This Payment Type and Payment Through mapping already exists for the selected Business Unit.'
    }
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    values: normalizedValues,
    errors,
  }
}
