/**
 * @file Validation schema and constants for User Location (AFM_USER_LOCATION).
 */

export const LOCATION_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const initialUserLocationValues = {
  BG_ID: '',
  BU_ID: '',
  GROUP_NAME: '',
  BUSINESS_UNIT: '',
  LOCATION: '',
  SHORT_NAME: '',
  STATUS: '1',
}

/**
 * Validates user location form fields.
 * @param {object} values Form values
 * @returns {{isValid: boolean, errors: object}}
 */
export function validateUserLocation(values) {
  const errors = {}

  if (!values.LOCATION || !String(values.LOCATION).trim()) {
    errors.LOCATION = 'Location is required'
  } else if (String(values.LOCATION).trim().length > 150) {
    errors.LOCATION = 'Location cannot exceed 150 characters'
  }

  if (values.SHORT_NAME && String(values.SHORT_NAME).trim().length > 50) {
    errors.SHORT_NAME = 'Short Name cannot exceed 50 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

