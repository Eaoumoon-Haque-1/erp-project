/**
 * @file Shared state/handlers for Custodian Create and Edit: parent values,
 * repeating Sub Custodian rows, client validation, and backend error mapping.
 */
import { useCallback, useState } from 'react'
import { mapCustodianApiError } from '../../../../api/custodian'
import { getApiErrorMessage } from '../../../../api/errors'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import { validateCustodian, validateSubCustodianRows } from '../validation/custodianValidation'
import { createSubCustodianRow } from './custodianApiMapper'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function useCustodianForm(initialValues, initialRows = []) {
  const [values, setValues] = useState(initialValues)
  const [rows, setRows] = useState(initialRows)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleRowChange = (rowId, name, value) => {
    setRows((current) => current.map((row) => (
      row._ROW_ID === rowId ? { ...row, [name]: value } : row
    )))
    if (name === 'SUB_CUSTODIAN_NAME') {
      setErrors((current) => ({ ...current, subRows: { ...current.subRows, [rowId]: undefined } }))
    }
  }

  // Add More is allowed only when every existing row passes validation.
  const handleAddRow = () => {
    const result = validateSubCustodianRows(rows, values.CUSTODIAN_NAME)
    if (!result.isValid) {
      setRows(result.rows)
      setErrors((current) => ({ ...current, subRows: result.subRows }))
      focusFirstInvalid()
      return
    }
    setRows((current) => [...current, createSubCustodianRow()])
  }

  // Saved rows (with an id) are not sent on save, so the backend sets them
  // Inactive: confirm first. Unsaved rows are dropped silently.
  const handleRemoveRow = async (row) => {
    if (row.ID) {
      const confirmed = await confirmAction({
        action: 'delete',
        entityName: 'Sub custodian',
        title: 'Remove sub custodian?',
        text: 'This row will be set to Inactive on save.',
      })
      if (!confirmed) return
    }
    setRows((current) => current.filter((item) => item._ROW_ID !== row._ROW_ID))
    setErrors((current) => ({ ...current, subRows: { ...current.subRows, [row._ROW_ID]: undefined } }))
  }

  const validate = () => {
    const result = validateCustodian(values, rows)
    setValues(result.values)
    setRows(result.rows)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  // Stable identity: the Edit page calls it from a data-loading effect.
  const reset = useCallback((nextValues, nextRows) => {
    setValues(nextValues)
    setRows(nextRows)
    setErrors({})
  }, [])

  // Backend errors that point at a field get an inline message AND the alert;
  // anything else is alert-only (FormPage shows it for the active action).
  const failWithApiError = async (error, fallbackMessage) => {
    const mapped = mapCustodianApiError(error, rows, fallbackMessage)
    if (!mapped.field && mapped.subRowIds.length === 0) {
      getApiErrorMessage(error, fallbackMessage)
      return
    }
    setErrors((current) => ({
      ...current,
      ...(mapped.field ? { [mapped.field]: mapped.message } : {}),
      ...(mapped.subRowIds.length > 0
        ? {
            subRows: {
              ...current.subRows,
              ...Object.fromEntries(mapped.subRowIds.map((id) => [id, mapped.message])),
            },
          }
        : {}),
    }))
    await showError(mapped.message)
  }

  return {
    values,
    rows,
    errors,
    handleChange,
    handleRowChange,
    handleAddRow,
    handleRemoveRow,
    validate,
    reset,
    failWithApiError,
  }
}
