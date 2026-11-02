/** @file API-backed edit controller for Asset Specification Mapping. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetSpecificationMapsApi } from '../api/assetSpecificationMapApi'
import AssetSpecificationMapForm from '../components/AssetSpecificationMapForm'
import { mapAssetSpecificationMapFromApi, mapAssetSpecificationMapToApi } from '../data/assetSpecificationMapApiMapper'
import { loadAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'
import {
  ASSET_ITEM_SPEC_TABLE,
  initialAssetSpecificationMapValues,
  validateAssetSpecificationMap,
} from '../validation/assetSpecificationMapValidation'

const listPath = '/asset/asset-specification-map'
const emptyReferences = { assetItems: [], specificationOptions: [] }
const fieldMap = {
  itemNameId: 'ITEM_NAME', specName: 'SPECIFICATION',
  sortOrder: 'SORT_ORDER', status: 'STATUS',
}

function AssetSpecificationMapEdit() {
  const { assetSpecificationMapId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const assetItemRef = useRef(null)
  const [values, setValues] = useState(initialAssetSpecificationMapValues)
  const [originalValues, setOriginalValues] = useState(initialAssetSpecificationMapValues)
  const [references, setReferences] = useState(emptyReferences)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetSpecificationMapReferences(sessionBusinessUnitId),
      assetSpecificationMapsApi.get(assetSpecificationMapId),
      assetSpecificationMapsApi.list({ businessUnitId: sessionBusinessUnitId }),
    ])
      .then(([loadedReferences, record, records]) => {
        if (!active) return
        const mapped = mapAssetSpecificationMapFromApi(record, loadedReferences)
        const specificationExists = loadedReferences.specificationOptions.some(
          (option) => option.value === mapped.SPECIFICATION,
        )
        const editReferences = specificationExists || !mapped.SPECIFICATION
          ? loadedReferences
          : {
            ...loadedReferences,
            specificationOptions: [
              ...loadedReferences.specificationOptions,
              { value: mapped.SPECIFICATION, label: mapped.SPECIFICATION_NAME },
            ],
          }
        setReferences(editReferences)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records
          .filter((item) => String(item.id) !== String(assetSpecificationMapId))
          .map((item) => mapAssetSpecificationMapFromApi(item, editReferences)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Specification Mapping.'))
      })
    return () => { active = false }
  }, [assetSpecificationMapId, sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME' ? {
        ITEM_NAME_LABEL: references.assetItems.find((item) => item.ID === value)?.ITEM_NAME || '',
      } : {}),
      ...(name === 'SPECIFICATION' ? { SPECIFICATION_NAME: value } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
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
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Asset Specification Mapping.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetItemRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Specification Mapping Edit'} listTo={listPath} tableName={ASSET_ITEM_SPEC_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <AssetSpecificationMapForm values={values} errors={errors} references={references} assetItemRef={assetItemRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetSpecificationMapEdit
