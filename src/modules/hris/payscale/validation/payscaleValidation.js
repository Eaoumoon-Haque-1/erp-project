/**
 * @file Backend-facing data contract and client validation for Payscale.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const PAY_SCALE_TABLE = 'HR_PAY_SCALE'
export const PAY_SCALE_DETAILS_TABLE = 'HR_PAY_SCALE_DTLS'

let rowSequence = 0

export function createPayScaleRow() {
  rowSequence += 1
  return {
    _ROW_ID: `pay-scale-row-${Date.now()}-${rowSequence}`,
    STAGE: '',
    BASIC: '',
    DEARNESS: '',
    HOUSE_RENT: '',
    CONVEYANCE: '',
    WASHING: '',
    MEDICAL: '',
    PF: '',
    FESTIVAL_BONUS: '',
    ANNUAL_BONUS: '',
    GRATUITY: '',
    GRAND_TOTAL: '0.00',
  }
}

export const createInitialPayScaleValues = () => ({
  GRADE_NAME: '',
  details: [createPayScaleRow()],
})

export const payComponentColumns = [
  'BASIC',
  'DEARNESS',
  'HOUSE_RENT',
  'CONVEYANCE',
  'WASHING',
  'MEDICAL',
  'PF',
  'FESTIVAL_BONUS',
  'ANNUAL_BONUS',
  'GRATUITY',
]

export function calculateGrandTotal(row) {
  const total = payComponentColumns.reduce((sum, key) => {
    const amount = Number(row[key])
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0)

  return total.toFixed(2)
}

function normalizeAmount(value) {
  return String(value ?? '').trim()
}

function hasMaximumTwoDecimals(value) {
  return /^\d+(?:\.\d{1,2})?$/.test(value)
}

export function validatePayScale(inputValues, existingGradeNames = []) {
  const values = {
    GRADE_NAME: String(inputValues.GRADE_NAME ?? '').trim(),
    details: inputValues.details.map((inputRow) => {
      const row = { ...inputRow }
      ;['STAGE', ...payComponentColumns].forEach((key) => {
        row[key] = normalizeAmount(row[key])
      })
      row.GRAND_TOTAL = calculateGrandTotal(row)
      return row
    }),
  }
  const fields = {}

  if (!values.GRADE_NAME) {
    fields.GRADE_NAME = 'Grade Name is required.'
  } else if (values.GRADE_NAME.length < 2) {
    fields.GRADE_NAME = 'Grade Name must be at least 2 characters.'
  } else if (values.GRADE_NAME.length > 100) {
    fields.GRADE_NAME = 'Grade Name must not exceed 100 characters.'
  } else if (existingGradeNames.some((name) => String(name).trim().toLowerCase() === values.GRADE_NAME.toLowerCase())) {
    fields.GRADE_NAME = 'Grade Name must be unique.'
  }

  const stageCounts = values.details.reduce((counts, row) => {
    if (row.STAGE) counts[row.STAGE] = (counts[row.STAGE] || 0) + 1
    return counts
  }, {})

  const details = values.details.map((row) => {
    const errors = {}

    if (!row.STAGE) {
      errors.STAGE = 'Stage is required.'
    } else if (!/^\d+$/.test(row.STAGE) || Number(row.STAGE) < 1 || Number(row.STAGE) > 99) {
      errors.STAGE = 'Stage must be a whole number from 1 to 99.'
    } else if (stageCounts[row.STAGE] > 1) {
      errors.STAGE = 'Stage must be unique within this Grade.'
    }

    if (!row.BASIC) {
      errors.BASIC = 'Basic is required.'
    } else if (!hasMaximumTwoDecimals(row.BASIC) || Number(row.BASIC) <= 0) {
      errors.BASIC = 'Basic must be greater than 0 with maximum 2 decimal places.'
    }

    payComponentColumns.filter((key) => key !== 'BASIC').forEach((key) => {
      if (row[key] && (!hasMaximumTwoDecimals(row[key]) || Number(row[key]) < 0)) {
        errors[key] = 'Enter a non-negative amount with maximum 2 decimal places.'
      }
    })

    return errors
  })

  return {
    values,
    errors: { fields, details },
    isValid: Object.keys(fields).length === 0 && details.every((row) => Object.keys(row).length === 0),
  }
}
