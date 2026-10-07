/**
 * @file Backend-facing data contract and client validation for Module.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const MODULE_TABLE = 'MODULES'

export const initialModuleValues = {
  MODULE_NAME: '',
  STATUS: '1',
}

export function validateModule(values, existingModuleNames = []) {
  const normalizedValues = {
    MODULE_NAME: String(values.MODULE_NAME ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.MODULE_NAME) {
    errors.MODULE_NAME = 'Module Name is required.'
  } else if (normalizedValues.MODULE_NAME.length < 2) {
    errors.MODULE_NAME = 'Module Name must be at least 2 characters.'
  } else if (normalizedValues.MODULE_NAME.length > 100) {
    errors.MODULE_NAME = 'Module Name must not exceed 100 characters.'
  } else if (existingModuleNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.MODULE_NAME.toLowerCase(),
  )) {
    errors.MODULE_NAME = 'Module Name must be unique.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
