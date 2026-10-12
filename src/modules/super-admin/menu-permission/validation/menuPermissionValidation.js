/**
 * @file Backend-facing data contract and client validation for Menu Permission.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const MENU_PERMISSION_TABLE = 'PERMISSIONS'

export const initialMenuPermissionValues = {
  PERMISSION_NAME: '',
  MODULE_ID: '',
  STATUS: '1',
}

export function validateMenuPermission(values, existingPermissionNames = []) {
  const normalizedValues = {
    PERMISSION_NAME: String(values.PERMISSION_NAME ?? '').trim(),
    MODULE_ID: String(values.MODULE_ID ?? ''),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.PERMISSION_NAME) {
    errors.PERMISSION_NAME = 'Permission Name is required.'
  } else if (normalizedValues.PERMISSION_NAME.length < 2) {
    errors.PERMISSION_NAME = 'Permission Name must be at least 2 characters.'
  } else if (normalizedValues.PERMISSION_NAME.length > 100) {
    errors.PERMISSION_NAME = 'Permission Name must not exceed 100 characters.'
  } else if (existingPermissionNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.PERMISSION_NAME.toLowerCase(),
  )) {
    errors.PERMISSION_NAME = 'Permission Name must be unique.'
  }

  if (!normalizedValues.MODULE_ID) {
    errors.MODULE_ID = 'Module Name is required.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

/** Validates repeatable Create rows while enforcing uniqueness across the batch. */
export function validateMenuPermissionRows(moduleId, rows, existingPermissionNames = []) {
  const normalizedModuleId = String(moduleId ?? '')
  const knownNames = new Set(
    existingPermissionNames.map((name) => String(name).trim().toLowerCase()),
  )
  const rowErrors = {}
  const normalizedRows = rows.map((row) => {
    const result = validateMenuPermission(
      { ...row, MODULE_ID: normalizedModuleId },
      [...knownNames],
    )
    const normalizedName = result.values.PERMISSION_NAME.toLowerCase()
    if (normalizedName && !result.errors.PERMISSION_NAME) knownNames.add(normalizedName)
    if (result.errors.PERMISSION_NAME) {
      rowErrors[row.key] = { PERMISSION_NAME: result.errors.PERMISSION_NAME }
    }
    return { ...row, ...result.values, key: row.key }
  })
  const moduleError = normalizedModuleId ? '' : 'Module Name is required.'

  return {
    moduleId: normalizedModuleId,
    rows: normalizedRows,
    moduleError,
    rowErrors,
    isValid: !moduleError && Object.keys(rowErrors).length === 0,
  }
}
