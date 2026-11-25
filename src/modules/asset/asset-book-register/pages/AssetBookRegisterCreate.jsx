/** @file API-backed Asset Book Register create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetBookRegisterApi } from '../api/assetBookRegisterApi'
import AssetBookRegisterForm from '../components/AssetBookRegisterForm'
import {
  mapAssetBookRegisterFromApi,
  mapAssetBookRegisterToApi,
} from '../data/assetBookRegisterApiMapper'
import { loadAssetBookRegisterReferences } from '../data/assetBookRegisterOptions'
import {
  ASSET_BOOK_REGISTER_TABLE,
  initialAssetBookRegisterValues,
  validateAssetBookRegister,
} from '../validation/assetBookRegisterValidation'

const listPath = '/asset/asset-book-register'
const fieldMap = {
  assetNo: 'ASSET_NO',
  assetItemId: 'ASSET_ITEM_ID',
  assetUnit: 'ASSET_UNIT',
  assetMajorCategoryId: 'ASSET_MAJOR_CATEGORY_ID',
  assetOwnerId: 'ASSET_OWNER_ID',
  allocationType: 'ALLOCATION_TYPE',
  allocationRefId: 'ALLOCATION_REF_ID',
  usageStatus: 'USAGE_STATUS',
  assetCondition: 'ASSET_CONDITION',
  assetStatus: 'ASSET_STATUS',
  allocationDate: 'ALLOCATION_DATE',
  status: 'STATUS',
}

function AssetBookRegisterCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const assetNoRef = useRef(null)

  const [values, setValues] = useState(() => ({
    ...initialAssetBookRegisterValues,
    BG_ID: sessionGroupId,
    BU_ID: sessionBusinessUnitId,
  }))
  const [errors, setErrors] = useState({})
  const [references, setReferences] = useState({})
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      loadAssetBookRegisterReferences(sessionBusinessUnitId, sessionGroupId),
      assetBookRegisterApi.list(sessionBusinessUnitId).catch(() => []),
    ])
      .then(([loadedReferences, records]) => {
        if (!active) return
        setReferences(loadedReferences)
        setExistingRecords(
          (records || []).map((r) => mapAssetBookRegisterFromApi(r, loadedReferences)),
        )
      })
      .catch((error) => {
        if (active) {
          setMessage(getApiErrorMessage(error, 'Unable to load Asset Book Register references.'))
        }
      })
    return () => {
      active = false
    }
  }, [sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetBookRegister(values, existingRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetBookRegisterApi.create(
        mapAssetBookRegisterToApi(result.values, {
          bgId: sessionGroupId,
          buId: sessionBusinessUnitId,
        }),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(
        applyApiFormErrors(error, setErrors, 'Unable to create Asset Book Register.', fieldMap),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialAssetBookRegisterValues,
      BG_ID: sessionGroupId,
      BU_ID: sessionBusinessUnitId,
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => assetNoRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Book Register Create'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      tableName={ASSET_BOOK_REGISTER_TABLE}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetBookRegisterForm
        values={values}
        errors={errors}
        references={references}
        submitLabel={'Save'}
        submitting={submitting}
        assetNoRef={assetNoRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default AssetBookRegisterCreate
