/** @file API-backed create controller for Asset Lookup Type. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetLookupTypesApi } from '../api/assetLookupTypeApi'
import AssetLookupTypeForm from '../components/AssetLookupTypeForm'
import { mapAssetLookupTypeToApi } from '../data/assetLookupTypeApiMapper'
import {
  ASSET_LOOKUP_TYPE_TABLE,
  initialAssetLookupTypeValues,
  validateAssetLookupType,
} from '../validation/assetLookupTypeValidation'

const listPath = '/asset/asset-lookup-type'
const fieldMap = { typeName: 'TYPE_NAME', typeCode: 'CODE', status: 'STATUS' }

function AssetLookupTypeCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetLookupTypeValues)
  const [errors, setErrors] = useState({})
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    assetLookupTypesApi.list(sessionBusinessUnitId)
      .then((records) => {
        if (active) setExistingRecords(records)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Asset Lookup Types.'))
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

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
      existingRecords.map((record) => record.typeName),
      existingRecords.map((record) => record.typeCode).filter(Boolean),
    )
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetLookupTypesApi.create(mapAssetLookupTypeToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(
        error,
        setErrors,
        'Unable to create Asset Lookup Type.',
        fieldMap,
      ))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialAssetLookupTypeValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Lookup Type Create'}
      listTo={listPath}
      tableName={ASSET_LOOKUP_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetLookupTypeForm values={values} errors={errors} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupTypeCreate

