/**
 * @file Create-page controller for HR Lookup Type.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { hrLookupTypesApi } from '../api/hrLookupTypeApi'
import HrLookupTypeForm from '../components/HrLookupTypeForm'
import { mapHrLookupTypeToApi } from '../data/hrLookupTypeApiMapper'
import {
  LOOKUP_TYPE_TABLE,
  initialHrLookupTypeValues,
  validateHrLookupType,
} from '../validation/hrLookupTypeValidation'

const listPath = '/hris/hr-lookup-settings/hr-lookup-type'

function HrLookupTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupTypeValues)
  const [errors, setErrors] = useState({})
  const [existingRecords, setExistingRecords] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    hrLookupTypesApi.list()
      .then((records) => {
        if (active) setExistingRecords(records)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing HR Lookup Types.'))
      })
    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
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

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await hrLookupTypesApi.create(mapHrLookupTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create HR Lookup Type.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialHrLookupTypeValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Type Create'}
      listTo={listPath}
      tableName={LOOKUP_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
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

export default HrLookupTypeCreate
