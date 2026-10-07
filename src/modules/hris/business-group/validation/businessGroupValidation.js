/**
 * @file Backend-facing data contract and client validation for Business Group.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const BUSINESS_GROUP_TABLE = 'HR_BG'

export const initialBusinessGroupValues = {
  GROUP_NAME: '',
  STATUS: '1',
}

export function validateBusinessGroup(values, existingGroupNames = []) {
  const normalizedValues = {
    GROUP_NAME: values.GROUP_NAME.trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.GROUP_NAME) {
    errors.GROUP_NAME = 'Group Name is required.'
  } else if (normalizedValues.GROUP_NAME.length < 2) {
    errors.GROUP_NAME = 'Group Name must be at least 2 characters.'
  } else if (normalizedValues.GROUP_NAME.length > 100) {
    errors.GROUP_NAME = 'Group Name must not exceed 100 characters.'
  } else {
    const normalizedName = normalizedValues.GROUP_NAME.toLowerCase()
    const isDuplicate = existingGroupNames.some(
      (name) => String(name).trim().toLowerCase() === normalizedName,
    )

    if (isDuplicate) {
      errors.GROUP_NAME = 'Group Name must be unique.'
    }
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
