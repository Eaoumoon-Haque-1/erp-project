/** @file Normalizes Axios/Spring errors into general and field-level messages. */
import { failActiveAction, showError } from '../components/shared/actionAlerts'

function normalizeFieldCollection(collection) {
  if (!collection) return {}
  if (!Array.isArray(collection)) {
    return typeof collection === 'object' ? collection : {}
  }

  return collection.reduce((result, item) => {
    if (item?.field && item?.message) result[item.field] = item.message
    return result
  }, {})
}

function defaultFormField(field) {
  const aliases = {
    isActive: 'STATUS',
    status: 'STATUS',
  }
  if (aliases[field]) return aliases[field]
  return String(field)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[.\-\s]+/g, '_')
    .toUpperCase()
}

export function normalizeApiError(error, fallbackMessage = 'Unable to complete the operation.', fieldMap = {}) {
  const responseData = error?.response?.data
  const rawFields = normalizeFieldCollection(
    responseData?.fieldErrors || responseData?.errors,
  )
  const fieldErrors = Object.entries(rawFields || {}).reduce((result, [field, message]) => {
    result[fieldMap[field] || defaultFormField(field)] = String(message)
    return result
  }, {})
  let message

  if (typeof responseData === 'string' && responseData.trim()) {
    message = responseData
  } else {
    message = responseData?.message || responseData?.error || (
      error?.response?.status === 403
        ? 'You do not have permission to perform this action.'
        : error?.code === 'ERR_NETWORK'
          ? 'Unable to connect to the server. Check the network connection and try again.'
          : fallbackMessage
    )
  }

  return { status: error?.response?.status, message, fieldErrors }
}

export function getApiErrorMessage(error, fallbackMessage) {
  const normalized = normalizeApiError(error, fallbackMessage)
  const handledByActiveAction = failActiveAction(normalized.message)
  if (!handledByActiveAction) void showError(normalized.message)
  return normalized.message
}

export function applyApiFormErrors(error, setErrors, fallbackMessage, fieldMap = {}) {
  const normalized = normalizeApiError(error, fallbackMessage, fieldMap)
  if (Object.keys(normalized.fieldErrors).length > 0) {
    setErrors((current) => ({ ...current, ...normalized.fieldErrors }))
  }
  failActiveAction(normalized.message)
  return normalized.message
}

export function getApiFieldErrors(error, fieldMap = {}) {
  return normalizeApiError(error, '', fieldMap).fieldErrors
}
