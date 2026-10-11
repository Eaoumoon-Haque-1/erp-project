/**
 * @file Shared state/handlers for Supplier Create and Edit: values, client
 * validation, and backend error mapping.
 */
import { useCallback, useState } from 'react'
import { mapSupplierApiError } from '../../../../api/supplier'
import { getApiErrorMessage } from '../../../../api/errors'
import { showError } from '../../../../components/shared/actionAlerts'
import { validateSupplier } from '../validation/vendorSupplierMasterValidation'

export default function useSupplierForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validate = () => {
    const result = validateSupplier(values)
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
    const mapped = mapSupplierApiError(error, fallbackMessage)
    if (!mapped.field) {
      getApiErrorMessage(error, fallbackMessage)
      return
    }
    setErrors((current) => ({ ...current, [mapped.field]: mapped.message }))
    await showError(mapped.message)
  }

  return { values, errors, handleChange, validate, reset, failWithApiError }
}
