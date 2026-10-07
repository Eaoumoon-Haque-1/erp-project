/** @file Create controller for Asset Lookup Type. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetLookupTypeForm from '../components/AssetLookupTypeForm'
import {
  createAssetLookupType,
  listAssetLookupTypes,
} from '../data/assetLookupTypeStore'
import {
  ASSET_LOOKUP_TYPE_TABLE,
  initialAssetLookupTypeValues,
  validateAssetLookupType,
} from '../validation/assetLookupTypeValidation'

const listPath = '/asset/asset-lookup-type'

function AssetLookupTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetLookupTypeValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const records = listAssetLookupTypes()
    const result = validateAssetLookupType(
      values,
      records.map((record) => record.TYPE_NAME),
      records.map((record) => record.CODE).filter(Boolean),
    )
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    createAssetLookupType(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialAssetLookupTypeValues)
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Lookup Type Create'} listTo={listPath} tableName={ASSET_LOOKUP_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetLookupTypeForm values={values} errors={errors} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupTypeCreate

