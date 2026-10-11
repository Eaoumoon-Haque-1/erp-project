/**
 * @file ASSET_CUSTODIAN and ASSET_CUSTODIAN_DTL defaults and client validation.
 * The backend remains the source of truth; these rules only give early feedback.
 * Errors: { BU_ID, CUSTODIAN_NAME, subRows: { [_ROW_ID]: message } }.
 */
import { isRequired } from '../../../../config/devFlags'
import { custodianBusinessGroup } from '../data/custodianScope'

export const ASSET_CUSTODIAN_TABLE = 'ASSET_CUSTODIAN'

export const createInitialCustodianValues = () => ({
  BG_ID: custodianBusinessGroup.ID,
  BU_ID: '',
  CUSTODIAN_NAME: '',
  STATUS: '1',
})

const normalizeName = (value) => String(value ?? '').trim()
const sameName = (a, b) => normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase()

function validateName(value, label) {
  const name = normalizeName(value)
  // RELAX_REQUIRED: an empty name is allowed; length checks run only when entered.
  if (!name) return isRequired() ? `${label} is required.` : ''
  if (name.length < 2) return `${label} must be at least 2 characters.`
  if (name.length > 100) return `${label} must not exceed 100 characters.`
  return ''
}

export function validateSubCustodianRows(rows, custodianName) {
  const subRows = {}
  const normalizedRows = rows.map((row) => ({
    ...row,
    SUB_CUSTODIAN_NAME: normalizeName(row.SUB_CUSTODIAN_NAME),
    STATUS: String(row.STATUS) === '0' ? '0' : '1',
  }))

  normalizedRows.forEach((row, index) => {
    let message = validateName(row.SUB_CUSTODIAN_NAME, 'Sub Custodian Name')
    if (!message && row.SUB_CUSTODIAN_NAME && normalizeName(custodianName) && sameName(row.SUB_CUSTODIAN_NAME, custodianName)) {
      message = 'Sub Custodian Name cannot match the Custodian Name.'
    }
    if (!message && row.SUB_CUSTODIAN_NAME && normalizedRows.some((other, otherIndex) => (
      otherIndex !== index && sameName(other.SUB_CUSTODIAN_NAME, row.SUB_CUSTODIAN_NAME)
    ))) {
      message = 'This Sub Custodian Name is duplicated.'
    }
    if (message) subRows[row._ROW_ID] = message
  })

  return { rows: normalizedRows, subRows, isValid: Object.keys(subRows).length === 0 }
}

export function validateCustodian(values, rows) {
  const normalized = {
    ...values,
    CUSTODIAN_NAME: normalizeName(values.CUSTODIAN_NAME),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalized.BU_ID) errors.BU_ID = 'Business Unit is required.'
  const nameError = validateName(normalized.CUSTODIAN_NAME, 'Custodian Name')
  if (nameError) errors.CUSTODIAN_NAME = nameError

  const rowResult = validateSubCustodianRows(rows, normalized.CUSTODIAN_NAME)
  if (!rowResult.isValid) errors.subRows = rowResult.subRows

  return {
    values: normalized,
    rows: rowResult.rows,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
