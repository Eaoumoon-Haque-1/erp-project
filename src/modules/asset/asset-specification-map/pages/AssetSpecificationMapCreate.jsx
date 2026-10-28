/** @file Create-page controller for Asset Specification Mapping. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import AssetSpecificationMapForm from '../components/AssetSpecificationMapForm'
import { getAssetSpecificationMapReferences } from '../data/assetSpecificationMapOptions'
import {
  createAssetSpecificationMap,
  listAssetSpecificationMaps,
} from '../data/assetSpecificationMapStore'
import {
  ASSET_ITEM_SPEC_TABLE,
  initialAssetSpecificationMapValues,
  validateAssetSpecificationMap,
} from '../validation/assetSpecificationMapValidation'

const listPath = '/asset/asset-specification-map'

function AssetSpecificationMapCreate() {
  const navigate = useNavigate()
  const assetItemRef = useRef(null)
  const [values, setValues] = useState(() => ({
    ...initialAssetSpecificationMapValues,
    SORT_ORDER: getNextSortOrder(listAssetSpecificationMaps()),
  }))
  const [errors, setErrors] = useState({})
  const references = getAssetSpecificationMapReferences()

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'ITEM_NAME' ? {
        ITEM_NAME_LABEL: references.assetItems
          .find((record) => record.ID === value)?.ITEM_NAME || '',
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
    const result = validateAssetSpecificationMap(
      values,
      listAssetSpecificationMaps(),
      references,
    )
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    createAssetSpecificationMap(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues({
      ...initialAssetSpecificationMapValues,
      SORT_ORDER: getNextSortOrder(listAssetSpecificationMaps()),
    })
    setErrors({})
    requestAnimationFrame(() => assetItemRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Specification Mapping Create'}
      listTo={listPath}
      tableName={ASSET_ITEM_SPEC_TABLE}
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

export default AssetSpecificationMapCreate
