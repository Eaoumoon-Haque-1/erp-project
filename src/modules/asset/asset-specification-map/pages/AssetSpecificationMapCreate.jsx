/**
 * @file API-backed create controller for Asset Specification Mapping.
 * Note: Group Name (bgId) and Business Unit (buId) are hidden from the UI
 * and automatically retrieved from the logged-in user's session data.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
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
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? session?.businessGroupId ?? '').trim()
  const sessionBusinessUnitId = String(session?.buId ?? session?.businessUnitId ?? '').trim()
  const assetItemRef = useRef(null)
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

  const handleChange = (event) => {
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

  const handleSubmit = async (event) => {
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

  const handleReset = () => {
    setValues({
      ...initialAssetSpecificationMapValues,
      BG_ID: sessionGroupId || values.BG_ID,
      BU_ID: sessionBusinessUnitId || values.BU_ID,
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetItemRef.current?.focus())
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
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetSpecificationMapForm
        values={values}
        errors={errors}
        references={references}
        assetItemRef={assetItemRef}
        submitLabel={'Save'}
        submitting={submitting}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetSpecificationMapCreate
