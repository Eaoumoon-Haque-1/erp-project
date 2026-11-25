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
  createInitialAssetItemSetRow,
  initialAssetItemInformationValues,
  validateAssetItemInformation,
} from '../validation/assetItemInformationValidation'

const listPath = '/asset/asset-item-information'
const categoryDerivedFields = ['CATEGORY_TYPE', 'DEPRI_METHOD', 'DEPRI_LIFE', 'DEPRI_PERCENTAGE', 'ASSET_OWNER']
const fieldMap = {
  itemName: 'ITEM_NAME',
  itemGroupId: 'ITEM_GROUP',
  itemPieceOrSet: 'ITEM_PIECE_OR_SET',
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
  const [setRows, setSetRows] = useState(() => [
    createInitialAssetItemSetRow({ BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }, 1),
  ])
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
    if (name === 'ITEM_PIECE_OR_SET' && nextValue === 'Set' && setRows.length === 0) {
      setSetRows([
        createInitialAssetItemSetRow({ BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }, 1),
      ])
    }
    setErrors((current) => {
      const next = { ...current, [name]: undefined }
      if (name === 'ASSET_DEPRI_CATE_ID') {
        categoryDerivedFields.forEach((field) => { next[field] = undefined })
      }
      if (name === 'ITEM_GROUP') next.ASSET_OWNER = undefined
      return next
    })
  }

  const handleSetRowChange = (index, field, value) => {
    setSetRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
    setErrors((prev) => ({
      ...prev,
      ITEM_SETS: undefined,
      [`setRow_${index}_${field}`]: undefined,
    }))
  }

  const handleAddSetRow = () => {
    setSetRows((prev) => [
      ...prev,
      createInitialAssetItemSetRow(
        { BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId },
        prev.length + 1,
      ),
    ])
    setErrors((prev) => ({ ...prev, ITEM_SETS: undefined }))
  }

  const handleRemoveSetRow = (index) => {
    setSetRows((prev) => {
      const filtered = prev.filter((_, i) => i !== index)
      return filtered.map((row, idx) => ({
        ...row,
        SORT_ORDER: String(idx + 1),
      }))
    })
    setErrors({})
  }

  const handleReorderSetRows = (fromIndex, toIndex) => {
    setSetRows((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((row, idx) => ({
        ...row,
        SORT_ORDER: String(idx + 1),
      }))
    })
    setErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetItemInformation(values, existingRecords, references, setRows)
    setValues({ ...values, ...result.values })
    setSetRows(result.setRows)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetItemsApi.create(
        mapAssetItemToApi(
          result.values,
          {
            bgId: sessionGroupId,
            buId: sessionBusinessUnitId,
          },
          result.setRows,
        ),
      )
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Asset Item.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialAssetItemInformationValues)
    setSetRows([
      createInitialAssetItemSetRow({ BG_ID: sessionGroupId, BU_ID: sessionBusinessUnitId }, 1),
    ])
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => itemNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Asset Item Information Create'}
      listTo={listPath}
      backTo={listPath}
      backLabel={'Back to List'}
      tableName={ASSET_ITEM_TABLE}
      submitLabel={'Save'}
      hideActions
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <AssetItemInformationForm
        values={values}
        errors={errors}
        references={references}
        setRows={setRows}
        submitLabel={'Save'}
        submitting={submitting}
        itemNameRef={itemNameRef}
        onChange={handleChange}
        onSetRowChange={handleSetRowChange}
        onAddSetRow={handleAddSetRow}
        onRemoveSetRow={handleRemoveSetRow}
        onReorderSetRows={handleReorderSetRows}
      />
    </FormPage>
  )
}

export default AssetItemInformationCreate
