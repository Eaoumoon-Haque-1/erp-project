/**
 * @file Shared state/handlers for Location Master Create and Edit: values,
 * dependent dropdown resets, client validation, and backend error mapping.
 */
import { useCallback, useState } from 'react'
import { mapAssetLocationApiError } from '../../../../api/assetLocation'
import { getApiErrorMessage } from '../../../../api/errors'
import { showError } from '../../../../components/shared/actionAlerts'
import { validateLocationMaster } from '../validation/locationMasterValidation'

// Changing a parent dropdown clears everything that depends on it.
const DEPENDENTS = {
  BU_ID: ['CUSTODIAN_ID', 'SUB_CUSTODIAN_ID'],
  CUSTODIAN_ID: ['SUB_CUSTODIAN_ID'],
}

export default function useLocationMasterForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const cleared = DEPENDENTS[name] ?? []
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...Object.fromEntries(cleared.map((key) => [key, ''])),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...Object.fromEntries(cleared.map((key) => [key, undefined])),
    }))
  }

  const validate = () => {
    const result = validateLocationMaster(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
    }
    return result
  }

  // Stable identity: the Edit page calls it from a data-loading effect.
  const reset = useCallback((nextValues) => {
    setValues(nextValues)
    setErrors({})
  }, [])

  // A backend error that points at a field gets an inline message AND one alert;
  // anything else is alert-only (FormPage shows it for the active action).
  const failWithApiError = async (error, fallbackMessage) => {
    const mapped = mapAssetLocationApiError(error, fallbackMessage)
    if (!mapped.field) {
      getApiErrorMessage(error, fallbackMessage)
      return
    }
    setErrors((current) => ({ ...current, [mapped.field]: mapped.message }))
    await showError(mapped.message)
  }

  return { values, errors, handleChange, validate, reset, failWithApiError }
}
