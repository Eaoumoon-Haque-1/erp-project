/** @file API-backed Asset Item Information edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetItemsApi } from '../api/assetItemApi'
import AssetItemInformationForm from '../components/AssetItemInformationForm'
import { mapAssetItemFromApi, mapAssetItemToApi } from '../data/assetItemApiMapper'
import {
  deriveAssetItemFields,
  getAssetItemReferences,
  loadAssetItemReferences,
} from '../data/assetItemInformationOptions'
import {
  ASSET_ITEM_TABLE,
  initialAssetItemInformationValues,
  validateAssetItemInformation,
} from '../validation/assetItemInformationValidation'

const listPath = '/asset/asset-item-information'
const categoryDerivedFields = ['CATEGORY_TYPE', 'DEPRI_METHOD', 'DEPRI_LIFE', 'DEPRI_PERCENTAGE', 'ASSET_OWNER']
const fieldMap = {
  itemName: 'ITEM_NAME',
  itemGroupId: 'ITEM_GROUP',
  assetDepriCatId: 'ASSET_DEPRI_CATE_ID',
  uomId: 'UOM',
  status: 'STATUS',
}

function AssetItemInformationEdit() {
  const { assetItemId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const itemNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetItemInformationValues)
  const [originalValues, setOriginalValues] = useState(initialAssetItemInformationValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(() => getAssetItemReferences())
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetItemReferences(sessionBusinessUnitId, sessionGroupId),
      assetItemsApi.get(assetItemId),
      assetItemsApi.list(sessionBusinessUnitId),
    ])
      .then(([loadedReferences, record, records]) => {
        if (!active) return
        const mapped = mapAssetItemFromApi(record, loadedReferences)
        setReferences(loadedReferences)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records
          .filter((item) => String(item.id) !== String(assetItemId))
          .map((item) => mapAssetItemFromApi(item, loadedReferences)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Item.'))
      })
    return () => { active = false }
  }, [assetItemId, sessionBusinessUnitId, sessionGroupId])

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
        categoryDerivedFields.forEach((field) => { next[field] = undefined })
      }
      if (name === 'ITEM_GROUP') next.ASSET_OWNER = undefined
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetItemInformation(values, existingRecords, references)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetItemsApi.update(assetItemId, mapAssetItemToApi(result.values, {
        bgId: sessionGroupId || values.BG_ID,
        buId: sessionBusinessUnitId || values.BU_ID,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Asset Item.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
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
      message={message}
      submitting={submitting}
    >
      <AssetItemInformationForm values={values} errors={errors} references={references} itemNameRef={itemNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetItemInformationEdit
