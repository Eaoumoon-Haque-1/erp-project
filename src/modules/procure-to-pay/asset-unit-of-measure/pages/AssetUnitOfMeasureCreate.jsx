/** @file API-backed create controller for Unit of Measure (UOM). */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { assetUnitsOfMeasureApi } from '../api/assetUnitOfMeasureApi'
import AssetUnitOfMeasureForm from '../components/AssetUnitOfMeasureForm'
import { mapAssetUnitOfMeasureFromApi, mapAssetUnitOfMeasureToApi } from '../data/assetUnitOfMeasureApiMapper'
import { ASSET_UNIT_OF_MEASURE_TABLE, createInitialAssetUnitOfMeasureValues, validateAssetUnitOfMeasure } from '../validation/assetUnitOfMeasureValidation'

const listPath = '/procure-to-pay/procurement-settings/asset-unit-of-measure'
const fieldMap = { unitName: 'UNIT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS' }

function AssetUnitOfMeasureCreate() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const unitNameRef = useRef(null)
  const createInitialValues = () => createInitialAssetUnitOfMeasureValues({
    businessGroupId: sessionGroupId,
    businessUnitId: sessionBusinessUnitId,
  })
  const [values, setValues] = useState(createInitialValues)
  const [errors, setErrors] = useState({})
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    assetUnitsOfMeasureApi.list(sessionBusinessUnitId)
      .then((records) => {
        if (!active) return
        setExistingRecords(records.map(mapAssetUnitOfMeasureFromApi))
        setValues((current) => ({ ...current, SORT_ORDER: getNextSortOrder(records) }))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Units of Measure.'))
      })
    return () => { active = false }
  }, [sessionBusinessUnitId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAssetUnitOfMeasure(values, existingRecords)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await assetUnitsOfMeasureApi.create(mapAssetUnitOfMeasureToApi(result.values, {
        bgId: sessionGroupId,
        buId: sessionBusinessUnitId,
      }))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Unit of Measure.', fieldMap))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({ ...createInitialValues(), SORT_ORDER: getNextSortOrder(existingRecords) })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => unitNameRef.current?.focus())
  }

  return (
    <FormPage title={'Unit of Measure (UOM) Create'} listTo={listPath} tableName={ASSET_UNIT_OF_MEASURE_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} submitting={submitting}>
      <AssetUnitOfMeasureForm values={values} errors={errors} unitNameRef={unitNameRef} onChange={handleChange} />
    </FormPage>
  )
}

export default AssetUnitOfMeasureCreate
