/** @file Edit controller for Asset Lookup Type temporary records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetLookupTypeForm from '../components/AssetLookupTypeForm'
import {
  getAssetLookupType,
  listAssetLookupTypes,
  updateAssetLookupType,
} from '../data/assetLookupTypeStore'
import {
  ASSET_LOOKUP_TYPE_TABLE,
  validateAssetLookupType,
} from '../validation/assetLookupTypeValidation'

const listPath = '/asset/asset-lookup-type'

function AssetLookupTypeEdit() {
  const { assetLookupTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const record = getAssetLookupType(assetLookupTypeId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})

  if (!record || !values) return <Navigate to={listPath} replace />

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
    const otherRecords = listAssetLookupTypes().filter((item) => item.ID !== record.ID)
    const result = validateAssetLookupType(
      values,
      otherRecords.map((item) => item.TYPE_NAME),
      otherRecords.map((item) => item.CODE).filter(Boolean),
    )
    setValues({ ...values, ...result.values })
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    updateAssetLookupType(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Lookup Type Edit'} listTo={listPath} tableName={ASSET_LOOKUP_TYPE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetLookupTypeForm values={values} errors={errors} typeNameRef={typeNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupTypeEdit

