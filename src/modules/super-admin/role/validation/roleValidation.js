/**
 * @file Backend-facing data contract and client validation for Role.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */
export const ROLE_TABLE = 'ROLES'

export const initialRoleValues = {
  PERMISSION_NAME: '',
  STATUS: '1',
}

export const initialRoleAssignmentValues = {
  MODULE_ID: '',
  MENU_ID: '',
  PERMISSION_ID: '',
}

export function validateRole(values, existingRoleNames = []) {
  const normalizedValues = {
    PERMISSION_NAME: String(values.PERMISSION_NAME ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (!normalizedValues.PERMISSION_NAME) {
    errors.PERMISSION_NAME = 'Role Name is required.'
  } else if (normalizedValues.PERMISSION_NAME.length < 2) {
    errors.PERMISSION_NAME = 'Role Name must be at least 2 characters.'
  } else if (normalizedValues.PERMISSION_NAME.length > 100) {
    errors.PERMISSION_NAME = 'Role Name must not exceed 100 characters.'
  } else if (existingRoleNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.PERMISSION_NAME.toLowerCase(),
  )) {
    errors.PERMISSION_NAME = 'Role Name must be unique.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function validateRoleAssignment(values, existingAssignments = []) {
  const normalizedValues = {
    MODULE_ID: String(values.MODULE_ID ?? ''),
    MENU_ID: String(values.MENU_ID ?? ''),
    PERMISSION_ID: String(values.PERMISSION_ID ?? ''),
  }
  const errors = {}

  if (!normalizedValues.MODULE_ID) errors.MODULE_ID = 'Module Name is required.'
  if (!normalizedValues.MENU_ID) errors.MENU_ID = 'Menu Name is required.'
  if (!normalizedValues.PERMISSION_ID) errors.PERMISSION_ID = 'Permission Name is required.'

  const isDuplicate = existingAssignments.some((assignment) => (
    String(assignment.MODULE_ID) === normalizedValues.MODULE_ID
    && String(assignment.MENU_ID) === normalizedValues.MENU_ID
    && String(assignment.PERMISSION_ID) === normalizedValues.PERMISSION_ID
  ))

  if (isDuplicate) {
    errors.PERMISSION_ID = 'This module, menu, and permission combination is already assigned.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
