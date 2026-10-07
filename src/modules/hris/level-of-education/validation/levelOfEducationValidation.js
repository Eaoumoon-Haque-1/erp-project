/**
 * @file Backend-facing data contract and client validation for Level Of Education.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const LEVEL_OF_EDUCATION_TABLE = 'HR_LEVEL_OF_EDU'

export const initialLevelOfEducationValues = {
  LEVEL_OF_EDU: '',
  SHORT_NAME: '',
  SORT_ORDER: '',
  STATUS: '1',
}

export function validateLevelOfEducation(values) {
  const errors = {}

  const trimmedLevel = (values.LEVEL_OF_EDU || '').trim()
  if (!trimmedLevel) {
    errors.LEVEL_OF_EDU = 'Level of Education is required.'
  } else if (trimmedLevel.length < 2) {
    errors.LEVEL_OF_EDU = 'Level of Education must be at least 2 characters.'
  } else if (trimmedLevel.length > 50) {
    errors.LEVEL_OF_EDU = 'Level of Education cannot exceed 50 characters.'
  }

  const trimmedShort = (values.SHORT_NAME || '').trim()
  if (trimmedShort) {
    if (trimmedShort.length < 2) {
      errors.SHORT_NAME = 'Short Name must be at least 2 characters.'
    } else if (trimmedShort.length > 5) {
      errors.SHORT_NAME = 'Short Name cannot exceed 5 characters.'
    }
  }

  const sortOrderStr = (values.SORT_ORDER || '').trim()
  if (sortOrderStr) {
    const num = Number(sortOrderStr)
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      errors.SORT_ORDER = 'Sort Order must be a positive integer greater than 0.'
    }
  }

  if (!values.STATUS && values.STATUS !== '0') {
    errors.STATUS = 'Status is required.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      ...values,
      LEVEL_OF_EDU: trimmedLevel,
      SHORT_NAME: trimmedShort,
      SORT_ORDER: sortOrderStr,
    },
  }
}
