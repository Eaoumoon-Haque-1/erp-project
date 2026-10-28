/**
 * @file Backend-facing data contract and client validation for Create Menu.
 * Sections: exact table constant, temporary options/records, initial values, normalization, and rules.
 * Keep spreadsheet table/column identifiers exact and return { values, errors, isValid }.
 */

export const MENU_TABLE = 'MENUES'

export const initialMenuValues = {
  MENU_NAME: '',
  IS_PARENT: '0',
  PARENT_MENU_ID: '',
  IS_TOP_MENU: '0',
  MODULE_ID: '',
  PERMISSION_ID: [],
  SORT_ORDER: '1',
  ROUTE_NAME: '',
  STATUS: '1',
}

export function validateMenu(values, existingMenuNames = []) {
  const normalizedValues = {
    MENU_NAME: String(values.MENU_NAME ?? '').trim(),
    IS_PARENT: String(values.IS_PARENT) === '1' ? '1' : '0',
    PARENT_MENU_ID: String(values.PARENT_MENU_ID ?? ''),
    IS_TOP_MENU: String(values.IS_TOP_MENU) === '1' ? '1' : '0',
    MODULE_ID: String(values.MODULE_ID ?? ''),
    PERMISSION_ID: Array.isArray(values.PERMISSION_ID)
      ? values.PERMISSION_ID.map(String)
      : String(values.PERMISSION_ID ?? '').split(',').map((id) => id.trim()).filter(Boolean),
    SORT_ORDER: String(values.SORT_ORDER ?? '').trim(),
    ROUTE_NAME: String(values.ROUTE_NAME ?? '').trim(),
    STATUS: String(values.STATUS) === '0' ? '0' : '1',
  }
  const errors = {}

  if (normalizedValues.IS_TOP_MENU === '1') {
    normalizedValues.IS_PARENT = '0'
    normalizedValues.PARENT_MENU_ID = ''
    normalizedValues.MODULE_ID = ''
    normalizedValues.PERMISSION_ID = []
    normalizedValues.ROUTE_NAME = '#'
  }

  if (!normalizedValues.MENU_NAME) {
    errors.MENU_NAME = 'Menu Name is required.'
  } else if (normalizedValues.MENU_NAME.length < 2) {
    errors.MENU_NAME = 'Menu Name must be at least 2 characters.'
  } else if (normalizedValues.MENU_NAME.length > 100) {
    errors.MENU_NAME = 'Menu Name must not exceed 100 characters.'
  } else if (existingMenuNames.some(
    (name) => String(name).trim().toLowerCase() === normalizedValues.MENU_NAME.toLowerCase(),
  )) {
    errors.MENU_NAME = 'Menu Name must be unique.'
  }

  if (normalizedValues.IS_TOP_MENU === '0') {
    if (!normalizedValues.MODULE_ID) {
      errors.MODULE_ID = 'Module Name is required.'
    }

    if (normalizedValues.PERMISSION_ID.length === 0) {
      errors.PERMISSION_ID = 'Select at least one Permission.'
    }

    if (!normalizedValues.ROUTE_NAME) {
      errors.ROUTE_NAME = 'Route Name is required.'
    } else if (normalizedValues.ROUTE_NAME.length < 2) {
      errors.ROUTE_NAME = 'Route Name must be at least 2 characters.'
    } else if (normalizedValues.ROUTE_NAME.length > 100) {
      errors.ROUTE_NAME = 'Route Name must not exceed 100 characters.'
    }
  }

  if (!/^[1-9]\d*$/.test(normalizedValues.SORT_ORDER)) {
    errors.SORT_ORDER = 'Sort Order must be a positive whole number.'
  }

  return {
    values: normalizedValues,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
