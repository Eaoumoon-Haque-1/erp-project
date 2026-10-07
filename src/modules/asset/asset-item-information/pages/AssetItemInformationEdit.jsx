/** @file Edit-page controller for temporary Asset Item Information records. */
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import AssetItemInformationForm from '../components/AssetItemInformationForm'
import {
  deriveAssetItemFields,
  getAssetItemReferences,
} from '../data/assetItemInformationOptions'
import {
  getAssetItem,
  listAssetItems,
  updateAssetItem,
} from '../data/assetItemInformationStore'
import {
  ASSET_ITEM_TABLE,
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

function AssetItemInformationEdit() {
  const { assetItemId } = useParams()
  const navigate = useNavigate()
  const itemNameRef = useRef(null)
  const record = getAssetItem(assetItemId)
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const references = getAssetItemReferences()

  if (!record || !values) return <Navigate to={listPath} replace />

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
    const otherRecords = listAssetItems().filter((item) => item.ID !== record.ID)
    const result = validateAssetItemInformation(values, otherRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    updateAssetItem(record.ID, result.values)
    navigate(listPath)
  }

  const handleReset = () => {
    setValues(record)
    setErrors({})
    requestAnimationFrame(() => itemNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Item Information Edit'}
      listTo={listPath}
      tableName={ASSET_ITEM_TABLE}
      submitLabel={'Update'}
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

export default AssetItemInformationEdit
