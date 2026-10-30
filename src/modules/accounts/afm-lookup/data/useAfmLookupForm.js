/**
 * @file Custom hook managing form state, repeatable lookup value rows, and validations for AFM Lookup Type setup.
 */
import { useCallback, useState } from 'react'
import { getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import {
  createInitialLookupValueRow,
  initialLookupTypeValues,
  validateAfmLookup,
} from '../validation/afmLookupValidation'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function useAfmLookupForm(
  initialFormValues = initialLookupTypeValues,
  initialRows = [createInitialLookupValueRow({}, 1)],
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
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
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
    setRows((current) => [...current, createInitialLookupValueRow({}, current.length + 1)])
  }

  const handleRemoveRow = async (row) => {
    if (row.ID && row.IN_USE) {
      await showError(
        `Cannot delete Lookup Value '${row.VALUE || row.ID}' because it is already used as a foreign key in another table (Payment Type / Voucher Type Mapping).`,
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

  const validate = () => {
    const result = validateAfmLookup(values, rows)
    setValues(result.values)
    setRows(result.rows)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  const reset = useCallback((nextValues, nextRows) => {
    setValues(nextValues || initialLookupTypeValues)
    setRows(
      nextRows && nextRows.length > 0
        ? nextRows
        : [createInitialLookupValueRow({}, 1)],
    )
    setErrors({})
  }, [])

  const failWithApiError = async (error, fallbackMessage) => {
    const normalized = normalizeApiError(error, fallbackMessage, {
      bgId: 'BG_ID',
      buId: 'BU_ID',
      typeName: 'TYPE_NAME',
      typeCode: 'TYPE_CODE',
      status: 'STATUS',
    })

    const message = normalized.message
    const lower = String(message).toLowerCase()
    const nextErrors = { ...normalized.fieldErrors }

    // Map duplicate type name / code messages to master fields
    if (lower.includes('type name already exists') || lower.includes('lookup type name')) {
      nextErrors.TYPE_NAME = message
    }
    if (lower.includes('type code already exists') || lower.includes('lookup type code')) {
      nextErrors.TYPE_CODE = message
    }

    // Map duplicate lookup value or code messages to relevant rows
    if (lower.includes('lookup value already exists') || lower.includes('duplicate lookup value')) {
      const matchedRow = rows.find((r) =>
        r.VALUE && lower.includes(r.VALUE.toLowerCase()),
      )
      if (matchedRow) {
        nextErrors.subRows = {
          ...nextErrors.subRows,
          [matchedRow._ROW_ID]: {
            ...nextErrors.subRows?.[matchedRow._ROW_ID],
            VALUE: message,
          },
        }
      }
    }

    setErrors((current) => ({ ...current, ...nextErrors }))
    await showError(message)
    getApiErrorMessage(error, fallbackMessage)
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
