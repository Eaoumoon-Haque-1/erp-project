/**
 * @file Custom hook managing form state, repeatable lookup value rows, and validations for Asset Lookup Type setup.
 */
import { useCallback, useState } from 'react'
import { getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import {
  createInitialAssetLookupValueRow,
  initialAssetLookupTypeValues,
  validateAssetLookupType,
} from '../validation/assetLookupTypeValidation'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function useAssetLookupTypeForm(
  initialFormValues = initialAssetLookupTypeValues,
  initialRows = [createInitialAssetLookupValueRow({}, 1)],
) {
  const [values, setValues] = useState(initialFormValues)
  const [rows, setRows] = useState(initialRows)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'BG_ID') {
        next.BU_ID = ''
      }
      if (name === 'TYPE_CODE') {
        next.CODE = nextValue
      } else if (name === 'CODE') {
        next.TYPE_CODE = nextValue
      }
      return next
    })
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'TYPE_CODE' ? { CODE: undefined } : {}),
      ...(name === 'CODE' ? { TYPE_CODE: undefined } : {}),
    }))
  }

  const handleRowChange = (rowId, name, value) => {
    setRows((current) =>
      current.map((row) => (row._ROW_ID === rowId ? { ...row, [name]: value } : row)),
    )
    setErrors((current) => {
      if (!current.subRows?.[rowId]?.[name]) return current
      const rowErrors = { ...current.subRows[rowId] }
      delete rowErrors[name]
      const nextSubRows = { ...current.subRows, [rowId]: rowErrors }
      if (Object.keys(rowErrors).length === 0) {
        delete nextSubRows[rowId]
      }
      return { ...current, subRows: nextSubRows }
    })
  }

  const handleAddRow = () => {
    setRows((current) => [...current, createInitialAssetLookupValueRow({}, current.length + 1)])
  }

  const handleRemoveRow = async (row) => {
    if (row.ID && row.IN_USE) {
      await showError(
        `Cannot delete Lookup Value '${row.VALUE || row.ID}' because it is already used as a reference in another table.`,
      )
      return
    }
    if (row.ID) {
      const confirmed = await confirmAction({
        action: 'delete',
        entityName: 'Lookup Value',
        title: 'Remove lookup value?',
        text: 'This lookup value will be permanently removed upon saving.',
      })
      if (!confirmed) return
    }
    setRows((current) => current.filter((item) => item._ROW_ID !== row._ROW_ID))
    setErrors((current) => {
      if (!current.subRows?.[row._ROW_ID]) return current
      const nextSubRows = { ...current.subRows }
      delete nextSubRows[row._ROW_ID]
      return { ...current, subRows: nextSubRows }
    })
  }

  const validate = (overrides = {}) => {
    const result = validateAssetLookupType({ ...values, ...overrides }, rows)
    setValues(result.values)
    setRows(result.rows)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  const reset = useCallback((nextValues, nextRows) => {
    setValues(nextValues || initialAssetLookupTypeValues)
    setRows(
      nextRows && nextRows.length > 0
        ? nextRows
        : [createInitialAssetLookupValueRow({}, 1)],
    )
    setErrors({})
  }, [])

  const failWithApiError = async (error, fallbackMessage) => {
    const normalized = normalizeApiError(error)
    const nextErrors = {}
    if (normalized.fieldErrors) {
      Object.entries(normalized.fieldErrors).forEach(([field, msg]) => {
        const upper = field.toUpperCase()
        if (upper === 'TYPENAME' || upper === 'TYPE_NAME') nextErrors.TYPE_NAME = msg
        else if (upper === 'TYPECODE' || upper === 'TYPE_CODE' || upper === 'CODE') nextErrors.TYPE_CODE = msg
        else nextErrors[field] = msg
      })
    }
    setErrors(nextErrors)
    focusFirstInvalid()
    await showError(getApiErrorMessage(error, fallbackMessage))
  }

  return {
    values,
    setValues,
    rows,
    setRows,
    errors,
    setErrors,
    handleChange,
    handleRowChange,
    handleAddRow,
    handleRemoveRow,
    validate,
    reset,
    failWithApiError,
  }
}
