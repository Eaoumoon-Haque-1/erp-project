/** @file API-backed Asset Item Information create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function AssetItemInformationCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const itemNameRef = useRef(null)
  const [values, setValues] = useState(initialAssetItemInformationValues)
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState(() => getAssetItemReferences())
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetItemReferences(sessionBusinessUnitId, sessionGroupId),
      assetItemsApi.list(sessionBusinessUnitId),
    ])
      .then(([loadedReferences, records]) => {
        if (!active) return
        setReferences(loadedReferences)
        setExistingRecords(records.map((record) => mapAssetItemFromApi(record, loadedReferences)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Asset Item references.'))
      })
    return () => { active = false }
  }, [sessionBusinessUnitId, sessionGroupId])

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
      await assetItemsApi.create(mapAssetItemToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Asset Item.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialAssetItemInformationValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => itemNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Item Information Create'}
      listTo={listPath}
      tableName={ASSET_ITEM_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetItemInformationForm values={values} errors={errors} references={references} itemNameRef={itemNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetItemInformationCreate
