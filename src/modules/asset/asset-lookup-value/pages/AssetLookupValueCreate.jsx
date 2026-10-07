/** @file Create controller for Asset Lookup Value. */
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import FormPage from '../../../../components/shared/FormPage'
import { listAssetLookupTypes } from '../../asset-lookup-type/data/assetLookupTypeStore'
import AssetLookupValueForm from '../components/AssetLookupValueForm'
import { createAssetLookupValue, listAssetLookupValues } from '../data/assetLookupValueStore'
import {
  ASSET_LOOKUP_VALUE_TABLE,
  createInitialAssetLookupValueValues,
  validateAssetLookupValue,
} from '../validation/assetLookupValueValidation'

const listPath = '/asset/asset-lookup-value'

function AssetLookupValueCreate() {
  const navigate = useNavigate()
  const valueRef = useRef(null)
  const [values, setValues] = useState(() => createInitialAssetLookupValueValues(currentUser.businessGroup))
  const [errors, setErrors] = useState({})
  const typeOptions = useMemo(() => listAssetLookupTypes()
    .filter((record) => record.STATUS === '1')
    .map((record) => ({ value: record.ID, label: record.TYPE_NAME })), [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'TYPE_ID' ? {
        TYPE_NAME: typeOptions.find((option) => option.value === value)?.label || '',
      } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetLookupValue(values, listAssetLookupValues())
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    createAssetLookupValue(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(createInitialAssetLookupValueValues(currentUser.businessGroup))
    setErrors({})
    requestAnimationFrame(() => valueRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Lookup Value Create'} listTo={listPath} tableName={ASSET_LOOKUP_VALUE_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetLookupValueForm values={values} errors={errors} typeOptions={typeOptions} valueRef={valueRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupValueCreate

