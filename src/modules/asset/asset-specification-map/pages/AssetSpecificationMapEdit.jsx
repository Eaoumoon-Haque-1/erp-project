/**
 * @file API-backed edit controller for Asset Specification Mapping.
 * Supports both Bulk Manage (reorderable table with drag-to-reorder for all specs of this item)
 * and Single Edit facility without removing either.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { usersApi } from '../../../super-admin/user/api/userApi'
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

function AssetSpecificationMapEdit() {
  const { assetSpecificationMapId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentMode = searchParams.get('mode') === 'bulk' ? 'bulk' : 'single'

  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const assetItemRef = useRef(null)

  // Single Edit state
  const [values, setValues] = useState(initialAssetSpecificationMapValues)
  const [originalValues, setOriginalValues] = useState(initialAssetSpecificationMapValues)
  const [auditLog, setAuditLog] = useState(null)
  const [bulkAuditLog, setBulkAuditLog] = useState(null)
  const [references, setReferences] = useState(emptyReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Bulk Edit state
  const [bulkRows, setBulkRows] = useState([])
  const [initialBulkRows, setInitialBulkRows] = useState([])
  const [bulkErrors, setBulkErrors] = useState({})
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkDeletedIds, setBulkDeletedIds] = useState([])

  // Ensure BG_ID is resolved if session has only buId
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
      assetSpecificationMapsApi.get(assetSpecificationMapId),
      assetSpecificationMapsApi.list({ businessUnitId: sessionBusinessUnitId }),
      usersApi.list().catch(() => []),
      employeesApi.list().catch(() => []),
    ])
      .then(([loadedReferences, record, records, users, employees]) => {
        if (!active) return

        const userMap = new Map(
          (users || []).map((u) => {
            const id = String(u.id ?? u.ID ?? '')
            const userName = u.userName ?? u.user_name ?? u.USER_NAME ?? id
            return [id, userName]
          }),
        )
        const empMap = new Map(
          (employees || []).map((e) => {
            const id = String(e.id ?? e.ID ?? '')
            const code = String(
              e.employeeCode ?? e.employee_code ?? e.EMPLOYEE_CODE ?? '',
            ).trim()
            const name = String(
              e.employeeName ?? e.employee_name ?? e.EMPLOYEE_NAME ?? '',
            ).trim()
            const display = code && name ? `${code}: ${name}` : code || name || id
            return [id, display]
          }),
        )

        const mapped = mapAssetSpecificationMapFromApi(record, loadedReferences, userMap, empMap)
        const specificationExists = loadedReferences.specificationOptions.some(
          (option) => option.value === mapped.SPECIFICATION,
        )
        const editReferences =
          specificationExists || !mapped.SPECIFICATION
            ? loadedReferences
            : {
                ...loadedReferences,
                specificationOptions: [
                  ...loadedReferences.specificationOptions,
                  {
                    value: mapped.SPECIFICATION,
                    label: mapped.SPECIFICATION_NAME || mapped.SPECIFICATION,
                  },
                ],
              }

        const resolvedValues = {
          ...mapped,
          BG_ID: sessionGroupId || mapped.BG_ID,
          BU_ID: sessionBusinessUnitId || mapped.BU_ID,
        }

        const auditData = {
          CREATED_USER_ID: mapped.CREATED_USER_ID,
          CREATED_USER_NAME: mapped.CREATED_USER_NAME,
          CREATED_EMP_ID: mapped.CREATED_EMP_ID,
          CREATED_EMP_NAME: mapped.CREATED_EMP_NAME,
          CREATED_DATETIME: mapped.CREATED_DATETIME,
          CREATED_APP: mapped.CREATED_APP,
          UPDATED_USER_ID: mapped.UPDATED_USER_ID,
          UPDATED_USER_NAME: mapped.UPDATED_USER_NAME,
          UPDATED_EMP_ID: mapped.UPDATED_EMP_ID,
          UPDATED_EMP_NAME: mapped.UPDATED_EMP_NAME,
          UPDATED_DATETIME: mapped.UPDATED_DATETIME,
          UPDATED_APP: mapped.UPDATED_APP,
          STATUS: mapped.STATUS,
        }

        setReferences(editReferences)
        setValues(resolvedValues)
        setOriginalValues(resolvedValues)
        setAuditLog(auditData)

        const mappedRecords = records.map((item) =>
          mapAssetSpecificationMapFromApi(item, editReferences, userMap, empMap),
        )
        setExistingRecords(
          mappedRecords.filter((item) => String(item.ID) !== String(assetSpecificationMapId)),
        )

        // Pre-populate all specifications for this item in Bulk Manage mode
        const itemRecords = mappedRecords
          .filter((item) => String(item.ITEM_NAME) === String(mapped.ITEM_NAME))
          .sort((a, b) => Number(a.SORT_ORDER || 0) - Number(b.SORT_ORDER || 0))

        // Last Specification map data for this asset item (used for Bulk mode Audit Log)
        const lastSpecRecord =
          itemRecords.length > 0 ? itemRecords[itemRecords.length - 1] : mapped
        const bulkAuditData = {
          CREATED_USER_ID: lastSpecRecord.CREATED_USER_ID,
          CREATED_USER_NAME: lastSpecRecord.CREATED_USER_NAME,
          CREATED_EMP_ID: lastSpecRecord.CREATED_EMP_ID,
          CREATED_EMP_NAME: lastSpecRecord.CREATED_EMP_NAME,
          CREATED_DATETIME: lastSpecRecord.CREATED_DATETIME,
          CREATED_APP: lastSpecRecord.CREATED_APP,
          UPDATED_USER_ID: lastSpecRecord.UPDATED_USER_ID,
          UPDATED_USER_NAME: lastSpecRecord.UPDATED_USER_NAME,
          UPDATED_EMP_ID: lastSpecRecord.UPDATED_EMP_ID,
          UPDATED_EMP_NAME: lastSpecRecord.UPDATED_EMP_NAME,
          UPDATED_DATETIME: lastSpecRecord.UPDATED_DATETIME,
          UPDATED_APP: lastSpecRecord.UPDATED_APP,
          STATUS: lastSpecRecord.STATUS,
        }
        setBulkAuditLog(bulkAuditData)

        const initialRows =
          itemRecords.length > 0
            ? itemRecords.map((r, idx) => ({
                _ROW_ID: `spec-row-${r.ID}`,
                ID: String(r.ID),
                SPECIFICATION: r.SPECIFICATION,
                SORT_ORDER: String(idx + 1),
                STATUS: String(r.STATUS ?? '1'),
              }))
            : [
                {
                  _ROW_ID: `spec-row-${mapped.ID}`,
                  ID: String(mapped.ID),
                  SPECIFICATION: mapped.SPECIFICATION,
                  SORT_ORDER: '1',
                  STATUS: String(mapped.STATUS ?? '1'),
                },
              ]

        setBulkRows(initialRows)
        setInitialBulkRows(initialRows)
      })
      .catch((error) => {
        if (active)
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Specification Mapping.'))
      })
    return () => {
      active = false
    }
  }, [assetSpecificationMapId, sessionBusinessUnitId, sessionGroupId])

  const handleModeChange = (nextMode) => {
    setSearchParams({ mode: nextMode })
    setMessage('')
    setBulkMessage('')
  }

  // --- Bulk Manage Handlers ---
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
    setBulkRows(initialBulkRows)
    setBulkDeletedIds([])
    setBulkErrors({})
    setBulkMessage('')
  }

  const handleBulkSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const newErrors = {}

    if (bulkRows.length === 0) {
      setBulkMessage('Please keep at least one specification.')
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
      const itemNameId = Number(values.ITEM_NAME)

      // 1. Delete removed rows
      for (const delId of bulkDeletedIds) {
        try {
          await assetSpecificationMapsApi.remove(delId)
        } catch {
          // ignore
        }
      }

      // 2. Insert or update rows in ASSET_ITEM_SPEC table
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
      setBulkMessage(getApiErrorMessage(error, 'Unable to update Asset Specification Mappings.'))
    } finally {
      setSubmitting(false)
    }
  }

  // --- Single Edit Handlers ---
  const handleSingleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME'
        ? {
            ITEM_NAME_LABEL:
              references.assetItems.find((item) => item.ID === value)?.ITEM_NAME || '',
          }
        : {}),
      ...(name === 'SPECIFICATION' ? { SPECIFICATION_NAME: value } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSingleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetSpecificationMap(values, existingRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetSpecificationMapsApi.update(
        assetSpecificationMapId,
        mapAssetSpecificationMapToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to update Asset Specification Mapping.', fieldMap),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSingleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetItemRef.current?.querySelector('input')?.focus())
  }

  return (
    <FormPage
      title={'Asset Specification Mapping Edit'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      createTo={`${listPath}/create`}
      createLabel={'Create New'}
      tableName={ASSET_ITEM_SPEC_TABLE}
      submitLabel={'Update'}
      hideActions
      onSubmit={currentMode === 'bulk' ? handleBulkSubmit : handleSingleSubmit}
      onReset={currentMode === 'bulk' ? handleBulkReset : handleSingleReset}
      message={currentMode === 'bulk' ? bulkMessage : message}
      submitting={submitting}
    >
      {currentMode === 'bulk' ? (
        <AssetSpecificationMapBulkForm
          selectedItemId={values.ITEM_NAME}
          onSelectItem={(itemId) => {
            setValues((prev) => ({ ...prev, ITEM_NAME: itemId }))
          }}
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
          submitLabel={'Update'}
          itemDisabled={true}
          mode={'bulk'}
          onModeChange={handleModeChange}
          auditLog={bulkAuditLog || auditLog}
          message={bulkMessage}
        />
      ) : (
        <AssetSpecificationMapForm
          values={values}
          errors={errors}
          references={references}
          auditLog={auditLog}
          submitLabel={'Update'}
          submitting={submitting}
          assetItemRef={assetItemRef}
          onChange={handleSingleChange}
          mode={'single'}
          onModeChange={handleModeChange}
        />
      )}
    </FormPage>
  )
}

export default AssetSpecificationMapEdit
