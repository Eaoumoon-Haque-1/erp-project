/** @file API-backed edit controller for Asset Lookup Value. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../api/assetLookupValueApi'
import AssetLookupValueForm from '../components/AssetLookupValueForm'
import {
  mapAssetLookupValueFromApi,
  mapAssetLookupValueToApi,
} from '../data/assetLookupValueApiMapper'
import {
  ASSET_LOOKUP_VALUE_TABLE,
  createInitialAssetLookupValueValues,
  validateAssetLookupValue,
} from '../validation/assetLookupValueValidation'

const listPath = '/asset/asset-lookup-value'
const fieldMap = {
  typeId: 'TYPE_ID', value: 'VALUE', typeCode: 'VALUE_CODE', valueCode: 'VALUE_CODE',
  sortOrder: 'SORT_ORDER', status: 'STATUS',
}

function AssetLookupValueEdit() {
  const { assetLookupValueId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const valueRef = useRef(null)
  const [values, setValues] = useState(createInitialAssetLookupValueValues)
  const [originalValues, setOriginalValues] = useState(createInitialAssetLookupValueValues)
  const [typeOptions, setTypeOptions] = useState([])
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupValuesApi.get(assetLookupValueId),
      assetLookupTypesApi.list(sessionBusinessUnitId),
      assetLookupValuesApi.list({ businessUnitId: sessionBusinessUnitId }),
    ])
      .then(([record, types, records]) => {
        if (!active) return
        const type = types.find((item) => String(item.id) === String(record.typeId))
        const mapped = mapAssetLookupValueFromApi(record, type?.typeName)
        setValues(mapped)
        setOriginalValues(mapped)
        setTypeOptions(types
          .filter((item) => String(item.status ?? 1) === '1' || String(item.id) === mapped.TYPE_ID)
          .map((item) => ({
            value: String(item.id),
            label: item.typeName,
            code: item.typeCode,
          })))
        setExistingRecords(records.filter((item) => String(item.id) !== String(assetLookupValueId)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Lookup Value.'))
      })
    return () => { active = false }
  }, [assetLookupValueId, sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    const selectedType = name === 'TYPE_ID'
      ? typeOptions.find((option) => option.value === value)
      : null
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'TYPE_ID' ? {
        TYPE_NAME: selectedType?.label || '',
        TYPE_CODE: selectedType?.code || '',
        VALUE_CODE: selectedType?.code || '',
      } : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'TYPE_ID' ? { VALUE_CODE: undefined } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const mappedExistingRecords = existingRecords.map((record) => ({
      TYPE_ID: String(record.typeId ?? ''),
      VALUE: record.value ?? '',
    }))
    const result = validateAssetLookupValue(values, mappedExistingRecords, typeOptions)
    setValues((current) => ({ ...current, ...result.values }))
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetLookupValuesApi.update(
        assetLookupValueId,
        mapAssetLookupValueToApi(result.values, {
          bgId: sessionGroupId || values.BG_ID,
          buId: sessionBusinessUnitId || values.BU_ID,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(
        error,
        setErrors,
        'Unable to update Asset Lookup Value.',
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
    requestAnimationFrame(() => valueRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Lookup Value Edit'}
      listTo={listPath}
      tableName={ASSET_LOOKUP_VALUE_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetLookupValueForm
        values={values}
        errors={errors}
        typeOptions={typeOptions}
        valueRef={valueRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetLookupValueEdit
