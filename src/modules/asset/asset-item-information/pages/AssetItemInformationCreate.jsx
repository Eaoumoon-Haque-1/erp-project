/** @file Create-page controller for Asset Item Information. */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetItemInformationForm from '../components/AssetItemInformationForm'
import {
  deriveAssetItemFields,
  getAssetItemReferences,
} from '../data/assetItemInformationOptions'
import { createAssetItem, listAssetItems } from '../data/assetItemInformationStore'
import {
  ASSET_ITEM_TABLE,
  initialAssetItemInformationValues,
  validateAssetItemInformation,
} from '../validation/assetItemInformationValidation'

const listPath = '/asset/asset-item-information'
const categoryDerivedFields = [
  'CATEGORY_TYPE',
  'DEPRI_METHOD',
  'DEPRI_LIFE',
  'DEPRI_PERCENTAGE',
  'ASSET_OWNER',
]

function AssetItemInformationCreate() {
  const navigate = useNavigate()
  const itemNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetItemInformationValues)
  const [errors, setErrors] = useState({})
  const references = getAssetItemReferences()

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({
      ...current,
      ...deriveAssetItemFields(name, nextValue, current, references),
    }))
    setErrors((current) => {
      const next = { ...current, [name]: undefined }
      if (name === 'ASSET_DEPRI_CATE_ID') {
        categoryDerivedFields.forEach((field) => {
          next[field] = undefined
        })
      }
      if (name === 'ITEM_GROUP') next.ASSET_OWNER = undefined
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateAssetItemInformation(
      values,
      listAssetItems(),
      references,
    )
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    createAssetItem(result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(initialAssetItemInformationValues)
    setErrors({})
    requestAnimationFrame(() => itemNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Item Information Create'}
      listTo={listPath}
      tableName={ASSET_ITEM_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <AssetItemInformationForm
        values={values}
        errors={errors}
        references={references}
        itemNameRef={itemNameRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetItemInformationCreate
