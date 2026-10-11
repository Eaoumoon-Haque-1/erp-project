/**
 * @file Shared state/handlers for Asset Receive Create and Edit: values, spec
 * rows, cascading dropdown resets, asset-item auto-fill, client validation and
 * backend error mapping. `refsRef.current` must hold the current reference data
 * (the page assigns it in an effect, because the data depends on form.values.BU_ID).
 */
import { useCallback, useState } from 'react'
import { mapAssetReceiveApiError } from '../../../../api/assetReceive'
import { getApiErrorMessage } from '../../../../api/errors'
import { confirmAction, showError } from '../../../../components/shared/actionAlerts'
import {
  WARRANTY_FIELDS,
  createInitialAssetReceiveValues,
  validateAssetReceive,
  validateSpecRows,
} from '../validation/assetReceiveApiValidation'
import { createSpecRow } from './assetReceiveApiMapper'

const focusFirstInvalid = () =>
  requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())

// Copies the depreciation defaults of a category into the form (all editable).
const applyCategory = (values, category) => (category ? {
  ...values,
  DEPRI_CATEGORY_ID: category.ID,
  DEPRI_METHOD_ID: category.METHOD_ID,
  ASSET_TYPE_ID: category.ASSET_TYPE_ID,
  DEPRI_LIFE: category.LIFE,
  DEPRI_PERCENTAGE: category.PERCENTAGE,
  ASSET_OWNER_ID: category.OWNER_ID,
} : values)

const CATEGORY_KEYS = ['DEPRI_CATEGORY_ID', 'DEPRI_METHOD_ID', 'ASSET_TYPE_ID', 'DEPRI_LIFE', 'DEPRI_PERCENTAGE', 'ASSET_OWNER_ID']

// Fields cleared when a parent field changes.
const clearFields = (keys) => Object.fromEntries(keys.map((key) => [key, '']))

// Pure: returns the next values and every key whose error should be cleared.
function applyChange(current, name, value, refs) {
  const next = { ...current, [name]: value }
  if (name === 'BU_ID') {
    // Everything below the Business Unit is reset.
    const reset = { ...createInitialAssetReceiveValues(), BG_ID: current.BG_ID, BU_ID: value, STATUS: current.STATUS }
    return { next: reset, changedKeys: Object.keys(reset) }
  }
  if (name === 'CUSTODIAN_ID') {
    return {
      next: { ...next, ...clearFields(['SUB_CUSTODIAN_ID', 'LOCATION_ID']) },
      changedKeys: [name, 'SUB_CUSTODIAN_ID', 'LOCATION_ID'],
    }
  }
  if (name === 'SUB_CUSTODIAN_ID') {
    return { next: { ...next, LOCATION_ID: '' }, changedKeys: [name, 'LOCATION_ID'] }
  }
  if (name === 'ITEM_NAME_ID') {
    const item = refs.items.find((record) => record.ID === value)
    const withCategory = { ...next, DEPRI_CATEGORY_ID: item?.CATEGORY_ID ?? '' }
    return {
      next: applyCategory(withCategory, refs.categories.find((record) => record.ID === item?.CATEGORY_ID)),
      changedKeys: [name, ...CATEGORY_KEYS],
    }
  }
  if (name === 'DEPRI_CATEGORY_ID') {
    return {
      next: applyCategory(next, refs.categories.find((record) => record.ID === value)),
      changedKeys: CATEGORY_KEYS,
    }
  }
  if (name === 'WG_APPLICABLE' && value === 'N/A') {
    return { next: { ...next, ...clearFields(WARRANTY_FIELDS) }, changedKeys: [name, ...WARRANTY_FIELDS] }
  }
  return { next, changedKeys: [name] }
}

export default function useAssetReceiveForm(initialValues, refsRef, initialRows = []) {
  const [values, setValues] = useState(initialValues)
  const [rows, setRows] = useState(initialRows)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const { next, changedKeys } = applyChange(values, name, type === 'checkbox' ? (checked ? '1' : '0') : value, refsRef.current)
    setValues(next)
    if (name === 'BU_ID') setRows([])
    setErrors((current) => (name === 'BU_ID'
      ? {}
      : { ...current, ...Object.fromEntries(changedKeys.map((key) => [key, undefined])) }))
  }

  const handleRowChange = (rowId, name, value) => {
    setRows((current) => current.map((row) => (row._ROW_ID === rowId ? { ...row, [name]: value } : row)))
    if (name !== 'STATUS') {
      setErrors((current) => ({
        ...current,
        specRows: { ...current.specRows, [rowId]: { ...current.specRows?.[rowId], [name]: undefined } },
      }))
    }
  }

  // Add More is allowed only when every existing spec row passes validation.
  const handleAddRow = () => {
    const result = validateSpecRows(rows)
    if (!result.isValid) {
      setRows(result.rows)
      setErrors((current) => ({ ...current, specRows: result.specRows }))
      focusFirstInvalid()
      return
    }
    setRows((current) => [...current, createSpecRow()])
  }

  // Saved rows (with an id) are not sent on save, so the backend sets them
  // Inactive: confirm first. Unsaved rows are dropped silently.
  const handleRemoveRow = async (row) => {
    if (row.ID) {
      const confirmed = await confirmAction({
        action: 'delete',
        entityName: 'Specification',
        title: 'Remove specification?',
        text: 'This row will be set to Inactive on save.',
      })
      if (!confirmed) return
    }
    setRows((current) => current.filter((item) => item._ROW_ID !== row._ROW_ID))
    setErrors((current) => ({ ...current, specRows: { ...current.specRows, [row._ROW_ID]: undefined } }))
  }

  const validate = () => {
    const result = validateAssetReceive(values, rows)
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

  // A backend error that points at a field gets an inline message AND one alert;
  // anything else is alert-only (FormPage shows it for the active action).
  const failWithApiError = async (error, fallbackMessage) => {
    const mapped = mapAssetReceiveApiError(error, rows, fallbackMessage)
    if (!mapped.field && mapped.specRowIds.length === 0) {
      getApiErrorMessage(error, fallbackMessage)
      return
    }
    setErrors((current) => ({
      ...current,
      ...(mapped.field ? { [mapped.field]: mapped.message } : {}),
      ...(mapped.specRowIds.length > 0
        ? {
            specRows: {
              ...current.specRows,
              ...Object.fromEntries(mapped.specRowIds.map((id) => [id, { EQUIPMENT_NAME: mapped.message }])),
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
