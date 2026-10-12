/** @file API-backed HR Lookup Type edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { hrLookupTypesApi } from '../api/hrLookupTypeApi'
import HrLookupTypeForm from '../components/HrLookupTypeForm'
import {
  mapHrLookupTypeFromApi,
  mapHrLookupTypeToApi,
} from '../data/hrLookupTypeApiMapper'
import {
  LOOKUP_TYPE_TABLE,
  initialHrLookupTypeValues,
  validateHrLookupType,
} from '../validation/hrLookupTypeValidation'

const listPath = '/hris/hr-lookup-settings/hr-lookup-type'

function HrLookupTypeEdit() {
  const { lookupTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupTypeValues)
  const [originalValues, setOriginalValues] = useState(initialHrLookupTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([hrLookupTypesApi.get(lookupTypeId), hrLookupTypesApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapHrLookupTypeFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(lookupTypeId)))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load HR Lookup Type.'))
      })
    return () => {
      active = false
    }
  }, [lookupTypeId])

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
    const result = validateHrLookupType(
      values,
      existingRecords.map((record) => record.typeName),
      existingRecords.map((record) => record.code).filter(Boolean),
    )
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await hrLookupTypesApi.update(lookupTypeId, mapHrLookupTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update HR Lookup Type.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Type Edit'}
      listTo={listPath}
      tableName={LOOKUP_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
    >
      <HrLookupTypeForm
        values={values}
        errors={errors}
        typeNameRef={typeNameRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default HrLookupTypeEdit
