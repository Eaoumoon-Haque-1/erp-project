/** @file API-backed HR Lookup Value create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../api/hrLookupValueApi'
import HrLookupValueForm from '../components/HrLookupValueForm'
import { mapHrLookupValueToApi } from '../data/hrLookupValueApiMapper'
import {
  LOOKUP_VALUE_TABLE,
  initialHrLookupValueValues,
  validateHrLookupValue,
} from '../validation/hrLookupValueValidation'

const listPath = '/hris/hr-lookup-settings/hr-lookup-value'

function HrLookupValueCreate() {
  const navigate = useNavigate()
  const typeRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupValueValues)
  const [errors, setErrors] = useState({})
  const [typeOptions, setTypeOptions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions } = useBusinessOptions('', { loadUnits: false })

  useEffect(() => {
    let active = true
    hrLookupTypesApi.list()
      .then((records) => {
        if (!active) return
        setTypeOptions(records
          .filter((record) => String(record.status ?? 1) === '1')
          .map((record) => ({ value: String(record.id), label: record.typeName })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load HR Lookup Types.'))
      })
    return () => {
      active = false
    }
  }, [])

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
    const result = validateHrLookupValue(values)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await hrLookupValuesApi.create(mapHrLookupValueToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create HR Lookup Value.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialHrLookupValueValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Value Create'}
      listTo={listPath}
      tableName={LOOKUP_VALUE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      message={message}
      submitting={submitting}
    >
      <HrLookupValueForm
        values={values}
        errors={errors}
        businessGroupOptions={groupOptions}
        hrLookupTypeOptions={typeOptions}
        typeRef={typeRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default HrLookupValueCreate
