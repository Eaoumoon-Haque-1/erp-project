/** @file Edit-page controller for temporary Asset Specification Mapping records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetSpecificationMapForm from '../components/AssetSpecificationMapForm'
import { getAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'
import {
  getAssetSpecificationMap,
  listAssetSpecificationMaps,
  updateAssetSpecificationMap,
} from '../data/assetSpecificationMapStore'
import {
  ASSET_ITEM_SPEC_TABLE,
  validateAssetSpecificationMap,
} from '../validation/assetSpecificationMapValidation'

const listPath = '/asset/asset-specification-map'

function AssetSpecificationMapEdit() {
  const { assetSpecificationMapId } = useParams()
  const navigate = useNavigate()
  const assetItemRef = useRef(null)
  const record = getAssetSpecificationMap(assetSpecificationMapId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetSpecificationMapReferences()

  if (!record || !values) return <Navigate to={listPath} replace />

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME' ? {
        ITEM_NAME_LABEL: references.assetItems
          .find((item) => item.ID === value)?.ITEM_NAME || '',
      } : {}),
      ...(name === 'SPECIFICATION' ? {
        SPECIFICATION_NAME: references.specificationOptions
          .find((option) => option.value === value)?.label || '',
      } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const otherRecords = listAssetSpecificationMaps()
      .filter((item) => item.ID !== record.ID)
    const result = validateAssetSpecificationMap(values, otherRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    updateAssetSpecificationMap(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => assetItemRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Specification Mapping Edit'}
      listTo={listPath}
      tableName={ASSET_ITEM_SPEC_TABLE}
      submitLabel={'Update'}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssetSpecificationMapForm
        values={values}
        errors={errors}
        references={references}
        assetItemRef={assetItemRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetSpecificationMapEdit
