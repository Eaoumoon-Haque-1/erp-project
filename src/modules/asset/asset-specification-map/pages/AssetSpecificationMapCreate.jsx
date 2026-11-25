/**
 * @file API-backed create controller for Asset Specification Mapping.
 * Supports both Bulk Entry (as per wireframe with drag-to-reorder table)
 * and Single Entry facility without removing either.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
import AssetSpecificationMapBulkForm from '../components/AssetSpecificationMapBulkForm'
import AssetSpecificationMapForm from '../components/AssetSpecificationMapForm'
import {
  mapAssetSpecificationMapFromApi,
  mapAssetSpecificationMapToApi,
} from '../data/assetSpecificationMapApiMapper'
import { loadAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'
import {
  ASSET_ITEM_SPEC_TABLE,
  initialAssetSpecificationMapValues,
  validateAssetSpecificationMap,
} from '../validation/assetSpecificationMapValidation'

const listPath = '/asset/asset-specification-map'
const emptyReferences = { assetItems: [], specificationOptions: [] }
const fieldMap = {
  itemNameId: 'ITEM_NAME',
  specName: 'SPECIFICATION',
  sortOrder: 'SORT_ORDER',
  status: 'STATUS',
}

function AssetSpecificationMapCreate() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentMode = searchParams.get('mode') === 'bulk' ? 'bulk' : 'single'

  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const assetItemRef = useRef(null)

  // Single Entry Form state
  const [values, setValues] = useState(() => ({
    ...initialAssetSpecificationMapValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(emptyReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Bulk Entry Form state
  const [selectedItemId, setSelectedItemId] = useState('')
  const [bulkRows, setBulkRows] = useState([
    { _ROW_ID: 'spec-row-1', ID: '', SPECIFICATION: '', SORT_ORDER: '1', STATUS: '1' },
  ])
  const [bulkErrors, setBulkErrors] = useState({})
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkDeletedIds, setBulkDeletedIds] = useState([])

  // Ensure BG_ID is populated even if only buId is in the session
  useEffect(() => {
    if (!sessionGroupId && sessionBusinessUnitId) {
      businessUnitsApi
        .get(sessionBusinessUnitId)
        .then((bu) => {
          if (bu?.bgId) {
            setValues((prev) => ({
              ...prev,
              BG_ID: String(bu.bgId),
            }))
          }
        })
        .catch(() => {})
    }
  }, [sessionGroupId, sessionBusinessUnitId])

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetSpecificationMapReferences(sessionBusinessUnitId),
      assetSpecificationMapsApi.list({ businessUnitId: sessionBusinessUnitId }),
    ])
      .then(([loadedReferences, records]) => {
        if (!active) return
        setReferences(loadedReferences)
        setExistingRecords(
          records.map((record) => mapAssetSpecificationMapFromApi(record, loadedReferences)),
        )
        setValues((current) => ({
          ...current,
          BG_ID: sessionGroupId || current.BG_ID,
          BU_ID: sessionBusinessUnitId || current.BU_ID,
          SORT_ORDER: getNextSortOrder(records),
        }))
      })
      .catch((error) => {
        if (active)
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Specification Mapping references.'))
      })
    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleModeChange = (nextMode) => {
    setSearchParams({ mode: nextMode })
    setMessage('')
    setBulkMessage('')
  }

  // --- Bulk Entry Handlers ---
  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId)
    setBulkErrors((prev) => ({ ...prev, ITEM_NAME: undefined }))
    setBulkDeletedIds([])

    if (!itemId) {
      setBulkRows([
        { _ROW_ID: `spec-row-${Date.now()}`, ID: '', SPECIFICATION: '', SORT_ORDER: '1', STATUS: '1' },
      ])
      return
    }

    // If this item already has mapped specifications in ASSET_ITEM_SPEC, load them
    const itemRecords = existingRecords
      .filter((r) => String(r.ITEM_NAME) === String(itemId))
      .sort((a, b) => Number(a.SORT_ORDER || 0) - Number(b.SORT_ORDER || 0))

    if (itemRecords.length > 0) {
      setBulkRows(
        itemRecords.map((r, idx) => ({
          _ROW_ID: `spec-row-${r.ID}`,
          ID: String(r.ID),
          SPECIFICATION: r.SPECIFICATION,
          SORT_ORDER: String(idx + 1),
          STATUS: String(r.STATUS ?? '1'),
        })),
      )
    } else {
      setBulkRows([
        { _ROW_ID: `spec-row-${Date.now()}`, ID: '', SPECIFICATION: '', SORT_ORDER: '1', STATUS: '1' },
      ])
    }
  }

  const handleReorderBulkRows = (fromIndex, toIndex) => {
    setBulkRows((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((row, idx) => ({
        ...row,
        SORT_ORDER: String(idx + 1),
      }))
    })
  }

  const handleAddBulkRow = () => {
    setBulkRows((prev) => [
      ...prev,
      {
        _ROW_ID: `spec-row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ID: '',
        SPECIFICATION: '',
        SORT_ORDER: String(prev.length + 1),
        STATUS: '1',
      },
    ])
  }

  const handleRemoveBulkRow = (index) => {
    setBulkRows((prev) => {
      const removed = prev[index]
      if (removed?.ID) {
        setBulkDeletedIds((d) => [...d, removed.ID])
      }
      const next = prev.filter((_, idx) => idx !== index)
      return next.map((row, idx) => ({
        ...row,
        SORT_ORDER: String(idx + 1),
      }))
    })
  }

  const handleBulkRowFieldChange = (index, field, value) => {
    setBulkRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    setBulkErrors((prev) => ({ ...prev, [`row_${index}_${field}`]: undefined }))
  }

  const handleBulkReset = () => {
    handleSelectItem(selectedItemId)
    setBulkErrors({})
    setBulkMessage('')
  }

  const handleBulkSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const newErrors = {}

    if (!selectedItemId) {
      newErrors.ITEM_NAME = 'Please select an Asset Item Name.'
    }

    if (bulkRows.length === 0) {
      setBulkMessage('Please add at least one specification.')
      return
    }

    const seenSpecs = new Set()
    bulkRows.forEach((row, idx) => {
      if (!row.SPECIFICATION || !String(row.SPECIFICATION).trim()) {
        newErrors[`row_${idx}_SPECIFICATION`] = 'Please select a specification.'
      } else {
        const key = String(row.SPECIFICATION).trim().toLowerCase()
        if (seenSpecs.has(key)) {
          newErrors[`row_${idx}_SPECIFICATION`] = `Duplicate specification: '${row.SPECIFICATION}'`
        } else {
          seenSpecs.add(key)
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setBulkErrors(newErrors)
      setBulkMessage('Please correct the highlighted errors before submitting.')
      return
    }

    setSubmitting(true)
    setBulkMessage('')

    try {
      const bgId = Number(sessionGroupId || values.BG_ID)
      const buId = Number(sessionBusinessUnitId || values.BU_ID)
      const itemNameId = Number(selectedItemId)

      // 1. Delete any removed rows that existed in backend
      for (const delId of bulkDeletedIds) {
        try {
          await assetSpecificationMapsApi.remove(delId)
        } catch {
          // ignore if already deleted
        }
      }

      // 2. Insert or update rows into ASSET_ITEM_SPEC table
      for (const row of bulkRows) {
        const payload = {
          bgId,
          buId,
          itemNameId,
          specName: row.SPECIFICATION.trim(),
          sortOrder: Number(row.SORT_ORDER || 1),
          status: Number(row.STATUS ?? 1),
        }

        if (row.ID) {
          await assetSpecificationMapsApi.update(row.ID, payload)
        } else {
          await assetSpecificationMapsApi.create(payload)
        }
      }

      navigate(listPath)
    } catch (error) {
      setBulkMessage(getApiErrorMessage(error, 'Unable to save Asset Specification Mappings.'))
    } finally {
      setSubmitting(false)
    }
  }

  // --- Single Entry Handlers ---
  const handleSingleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME'
        ? {
            ITEM_NAME_LABEL:
              references.assetItems.find((record) => record.ID === value)?.ITEM_NAME || '',
          }
        : {}),
      ...(name === 'SPECIFICATION' ? { SPECIFICATION_NAME: value } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSingleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetSpecificationMap(values, existingRecords, references)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetSpecificationMapsApi.create(
        mapAssetSpecificationMapToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to create Asset Specification Mapping.', fieldMap),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSingleReset = () => {
    setValues({
      ...initialAssetSpecificationMapValues,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetItemRef.current?.querySelector('input')?.focus())
  }

  return (
    <FormPage
      title={'Asset Specification Mapping Create'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      tableName={ASSET_ITEM_SPEC_TABLE}
      submitLabel={'Save'}
      hideActions
      onSubmit={currentMode === 'bulk' ? handleBulkSubmit : handleSingleSubmit}
      onReset={currentMode === 'bulk' ? handleBulkReset : handleSingleReset}
      message={currentMode === 'bulk' ? bulkMessage : message}
      submitting={submitting}
    >
      {currentMode === 'bulk' ? (
        <AssetSpecificationMapBulkForm
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
          rows={bulkRows}
          onRowFieldChange={handleBulkRowFieldChange}
          onAddRow={handleAddBulkRow}
          onRemoveRow={handleRemoveBulkRow}
          onReorderRows={handleReorderBulkRows}
          onReset={handleBulkReset}
          onSubmit={handleBulkSubmit}
          references={references}
          errors={bulkErrors}
          submitting={submitting}
          submitLabel={'Save'}
          mode={'bulk'}
          onModeChange={handleModeChange}
          message={bulkMessage}
        />
      ) : (
        <AssetSpecificationMapForm
          values={values}
          errors={errors}
          references={references}
          assetItemRef={assetItemRef}
          submitLabel={'Save'}
          submitting={submitting}
          onChange={handleSingleChange}
          mode={'single'}
          onModeChange={handleModeChange}
        />
      )}
    </FormPage>
  )
}

export default AssetSpecificationMapCreate
