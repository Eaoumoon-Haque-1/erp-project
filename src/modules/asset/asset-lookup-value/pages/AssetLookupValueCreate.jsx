/** @file API-backed create controller for Asset Lookup Value. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { assetLookupTypesApi } from '../../asset-lookup-type/api/assetLookupTypeApi'
import { assetLookupValuesApi } from '../api/assetLookupValueApi'
import AssetLookupValueForm from '../components/AssetLookupValueForm'
import { mapAssetLookupValueToApi } from '../data/assetLookupValueApiMapper'
import {
  ASSET_LOOKUP_VALUE_TABLE,
  createInitialAssetLookupValueValues,
  validateAssetLookupValue,
} from '../validation/assetLookupValueValidation'

const listPath = '/asset/asset-lookup-value'
const fieldMap = {
  typeId: 'TYPE_ID',
  value: 'VALUE',
  typeCode: 'VALUE_CODE',
  valueCode: 'VALUE_CODE',
  sortOrder: 'SORT_ORDER',
  status: 'STATUS',
}

function AssetLookupValueCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const valueRef = useRef(null)
  const createInitialValues = () => createInitialAssetLookupValueValues({
    businessGroupId: sessionGroupId,
    businessUnitId: sessionBusinessUnitId,
  })
  const [values, setValues] = useState(createInitialValues)
  const [errors, setErrors] = useState({})
  const [typeOptions, setTypeOptions] = useState([])
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      assetLookupTypesApi.list(sessionBusinessUnitId),
      assetLookupValuesApi.list({ businessUnitId: sessionBusinessUnitId }),
    ])
      .then(([types, records]) => {
        if (!active) return
        setTypeOptions(types
          .filter((record) => String(record.status ?? 1) === '1')
          .map((record) => ({
            value: String(record.id),
            label: record.typeName,
            code: record.typeCode,
          })))
        setExistingRecords(records)
        setValues((current) => ({
          ...current,
          SORT_ORDER: getNextSortOrder(records),
        }))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Lookup Value references.'))
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

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
      ...(name === 'TYPE_ID' ? { VALUE_CODE: undefined, SORT_ORDER: undefined } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const mappedExistingRecords = existingRecords.map((record) => ({
      TYPE_ID: String(record.typeId ?? ''),
      VALUE: record.value ?? '',
    }))
    const result = validateAssetLookupValue(values, mappedExistingRecords, typeOptions)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetLookupValuesApi.create(mapAssetLookupValueToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(
        error,
        setErrors,
        'Unable to create Asset Lookup Value.',
        fieldMap,
      ))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...createInitialValues(),
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => valueRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Lookup Value Create'}
      listTo={listPath}
      tableName={ASSET_LOOKUP_VALUE_TABLE}
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

export default AssetLookupValueCreate
