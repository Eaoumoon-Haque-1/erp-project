/**
 * @file ASSET_LOCATION defaults and client validation (mirrors backend rules;
 * the backend remains the source of truth, including uniqueness checks).
 */
import { isRequired } from '../../../../config/devFlags'
import { locationBusinessGroup } from '../data/locationMasterScope'

export const ASSET_LOCATION_TABLE = 'ASSET_LOCATION'

export const createInitialLocationMasterValues = () => ({
  BG_ID: locationBusinessGroup.ID,
  BU_ID: '',
  CUSTODIAN_ID: '',
  SUB_CUSTODIAN_ID: '',
  DEPT_ID: '',
  LOCATION_NAME: '',
  LOCATION_CODE: '',
  ADDRESS: '',
  BUILDING: '',
  FLOOR: '',
  ROOM: '',
  STATUS: '1',
})

const TEXT_RULES = [
  ['LOCATION_NAME', 'Location Name', 2, 100],
  ['LOCATION_CODE', 'Location Code', 2, 30],
  ['ADDRESS', 'Address', 5, 255],
  ['BUILDING', 'Building', 1, 100],
  ['FLOOR', 'Floor', 1, 20],
  ['ROOM', 'Room', 1, 50],
]

const REQUIRED_SELECTS = [
  ['BU_ID', 'Business Unit'],
  ['CUSTODIAN_ID', 'Custodian'],
  ['SUB_CUSTODIAN_ID', 'Sub Custodian'],
  ['DEPT_ID', 'Department'],
]

export function validateLocationMaster(values) {
  const normalized = { ...values, STATUS: String(values.STATUS) === '0' ? '0' : '1' }
  const errors = {}

  REQUIRED_SELECTS.forEach(([key, label]) => {
    if (!String(normalized[key] ?? '')) errors[key] = `${label} is required.`
  })

  TEXT_RULES.forEach(([key, label, min, max]) => {
    const value = String(normalized[key] ?? '').trim()
    normalized[key] = value
    // RELAX_REQUIRED: empty text fields are allowed; format/length checks run only when entered.
    if (!value) {
      if (isRequired()) errors[key] = `${label} is required.`
    } else if (value.length < min) errors[key] = `${label} must be at least ${min} character${min > 1 ? 's' : ''}.`
    else if (value.length > max) errors[key] = `${label} must not exceed ${max} characters.`
  })

  if (!errors.LOCATION_CODE && normalized.LOCATION_CODE && !/^[A-Za-z0-9_-]+$/.test(normalized.LOCATION_CODE)) {
    errors.LOCATION_CODE = 'Location Code allows only letters, digits, hyphen and underscore.'
  }

  return { values: normalized, errors, isValid: Object.keys(errors).length === 0 }
}
