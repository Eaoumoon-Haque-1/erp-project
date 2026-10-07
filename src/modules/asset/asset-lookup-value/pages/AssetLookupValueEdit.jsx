/** @file Edit controller for Asset Lookup Value temporary records. */
import { useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { listAssetLookupTypes } from '../../asset-lookup-type/data/assetLookupTypeStore'
import AssetLookupValueForm from '../components/AssetLookupValueForm'
import {
  getAssetLookupValue,
  listAssetLookupValues,
  updateAssetLookupValue,
} from '../data/assetLookupValueStore'
import {
  ASSET_LOOKUP_VALUE_TABLE,
  validateAssetLookupValue,
} from '../validation/assetLookupValueValidation'

const listPath = '/asset/asset-lookup-value'

function AssetLookupValueEdit() {
  const { assetLookupValueId } = useParams()
  const navigate = useNavigate()
  const valueRef = useRef(null)
  const record = getAssetLookupValue(assetLookupValueId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const typeOptions = useMemo(() => listAssetLookupTypes()
    .filter((type) => type.STATUS === '1' || type.ID === record?.TYPE_ID)
    .map((type) => ({ value: type.ID, label: type.TYPE_NAME })), [record?.TYPE_ID])

  if (!record || !values) return <Navigate to={listPath} replace />

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
    const otherRecords = listAssetLookupValues().filter((item) => item.ID !== record.ID)
    const result = validateAssetLookupValue(values, otherRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    updateAssetLookupValue(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => valueRef.current?.focus())
  }

  return (
    <FormPage title={'Asset Lookup Value Edit'} listTo={listPath} tableName={ASSET_LOOKUP_VALUE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset}>
      <AssetLookupValueForm values={values} errors={errors} typeOptions={typeOptions} valueRef={valueRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetLookupValueEdit

