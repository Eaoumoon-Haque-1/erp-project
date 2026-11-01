/** @file API-backed edit controller for Asset Lookup Type. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetLookupTypesApi } from '../api/assetLookupTypeApi'
import AssetLookupTypeForm from '../components/AssetLookupTypeForm'
import {
  mapAssetLookupTypeFromApi,
  mapAssetLookupTypeToApi,
} from '../data/assetLookupTypeApiMapper'
import {
  ASSET_LOOKUP_TYPE_TABLE,
  initialAssetLookupTypeValues,
  validateAssetLookupType,
} from '../validation/assetLookupTypeValidation'

const listPath = '/asset/asset-lookup-type'
const fieldMap = { typeName: 'TYPE_NAME', typeCode: 'CODE', status: 'STATUS' }

function AssetLookupTypeEdit() {
  const { assetLookupTypeId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetLookupTypeValues)
  const [originalValues, setOriginalValues] = useState(initialAssetLookupTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupTypesApi.get(assetLookupTypeId),
      assetLookupTypesApi.list(sessionBusinessUnitId),
    ])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapAssetLookupTypeFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(assetLookupTypeId)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Lookup Type.'))
      })
    return () => { active = false }
  }, [assetLookupTypeId, sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetLookupType(
      values,
      existingRecords.map((item) => item.typeName),
      existingRecords.map((item) => item.typeCode).filter(Boolean),
    )
    setValues({ ...values, ...result.values })
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetLookupTypesApi.update(
        assetLookupTypeId,
        mapAssetLookupTypeToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(
        error,
        setErrors,
        'Unable to update Asset Lookup Type.',
        fieldMap,
      ))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Lookup Type Edit'}
      listTo={listPath}
      tableName={ASSET_LOOKUP_TYPE_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetLookupTypeForm values={values} errors={errors} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupTypeEdit

