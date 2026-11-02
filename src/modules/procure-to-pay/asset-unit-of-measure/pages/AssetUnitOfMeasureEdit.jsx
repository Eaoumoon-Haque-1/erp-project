/** @file API-backed edit controller for Unit of Measure (UOM). */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { assetUnitsOfMeasureApi } from '../api/assetUnitOfMeasureApi'
import AssetUnitOfMeasureForm from '../components/AssetUnitOfMeasureForm'
import { mapAssetUnitOfMeasureFromApi, mapAssetUnitOfMeasureToApi } from '../data/assetUnitOfMeasureApiMapper'
import { ASSET_UNIT_OF_MEASURE_TABLE, createInitialAssetUnitOfMeasureValues, validateAssetUnitOfMeasure } from '../validation/assetUnitOfMeasureValidation'

const listPath = '/procure-to-pay/procurement-settings/asset-unit-of-measure'
const fieldMap = { unitName: 'UNIT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS' }

function AssetUnitOfMeasureEdit() {
  const { assetUnitOfMeasureId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const unitNameRef = useRef(null)
  const [values, setValues] = useState(createInitialAssetUnitOfMeasureValues)
  const [originalValues, setOriginalValues] = useState(createInitialAssetUnitOfMeasureValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      assetUnitsOfMeasureApi.get(assetUnitOfMeasureId),
      assetUnitsOfMeasureApi.list(sessionBusinessUnitId),
    ])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapAssetUnitOfMeasureFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records
          .filter((item) => String(item.id) !== String(assetUnitOfMeasureId))
          .map(mapAssetUnitOfMeasureFromApi))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load Unit of Measure.'))
      })
    return () => { active = false }
  }, [assetUnitOfMeasureId, sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetUnitOfMeasure(values, existingRecords)
    setValues({ ...values, ...result.values })
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetUnitsOfMeasureApi.update(assetUnitOfMeasureId, mapAssetUnitOfMeasureToApi(result.values, {
        bgId: sessionGroupId || values.BG_ID,
        buId: sessionBusinessUnitId || values.BU_ID,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Unit of Measure.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => unitNameRef.current?.focus())
  }

  return (
    <FormPage title={'Unit of Measure (UOM) Edit'} listTo={listPath} tableName={ASSET_UNIT_OF_MEASURE_TABLE} submitLabel={'Update'} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <AssetUnitOfMeasureForm values={values} errors={errors} unitNameRef={unitNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetUnitOfMeasureEdit
