/**
 * @file Custom hook managing form state, repeatable account rows, and validations for Bank setup.
 */
import { useCallback, useState } from 'react'
import { getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import {
  createInitialBankDetailRow,
  initialBankValues,
  validateBank,
} from '../validation/bankValidation'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

export default function useBankForm(
  initialFormValues = initialBankValues,
  initialRows = [createInitialBankDetailRow()],
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
    setRows((current) => [...current, createInitialBankDetailRow()])
  }

  const handleRemoveRow = async (row) => {
    if (row.ID) {
      const confirmed = await confirmAction({
        action: 'delete',
        entityName: 'Bank Account Detail',
        title: 'Remove bank account?',
        text: 'This account will be removed upon saving.',
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
    const result = validateBank(values, rows)
    setValues(result.values)
    setRows(result.rows)
    setErrors(result.errors)
    if (!result.isValid) focusFirstInvalid()
    return result
  }

  const reset = useCallback((nextValues, nextRows) => {
    setValues(nextValues || initialBankValues)
    setRows(
      nextRows && nextRows.length > 0
        ? nextRows
        : [createInitialBankDetailRow()],
    )
    setErrors({})
  }, [])

  const failWithApiError = async (error, fallbackMessage) => {
    const normalized = normalizeApiError(error, fallbackMessage, {
      bgId: 'BG_ID',
      buId: 'BU_ID',
      bankName: 'BANK_NAME',
      shortName: 'SHORT_NAME',
      status: 'STATUS',
    })

    const message = normalized.message
    const lower = String(message).toLowerCase()
    const nextErrors = { ...normalized.fieldErrors }

    // Map backend duplicate messages to relevant fields
    if (lower.includes('bank name') || lower.includes('bank already exists')) {
      nextErrors.BANK_NAME = message
    }

    if (lower.includes('account number')) {
      // Find row matching duplicate account number if mentioned
      const matchedRow = rows.find((r) =>
        r.ACCOUNT_NUMBER && lower.includes(r.ACCOUNT_NUMBER.toLowerCase()),
      )
      if (matchedRow) {
        nextErrors.subRows = {
          ...nextErrors.subRows,
          [matchedRow._ROW_ID]: {
            ...nextErrors.subRows?.[matchedRow._ROW_ID],
            ACCOUNT_NUMBER: message,
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
