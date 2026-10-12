/** @file API-backed HR Lookup Value edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../api/hrLookupValueApi'
import HrLookupValueForm from '../components/HrLookupValueForm'
import {
  mapHrLookupValueFromApi,
  mapHrLookupValueToApi,
} from '../data/hrLookupValueApiMapper'
import {
  LOOKUP_VALUE_TABLE,
  initialHrLookupValueValues,
  validateHrLookupValue,
} from '../validation/hrLookupValueValidation'

const listPath = '/hris/hr-lookup-settings/hr-lookup-value'

function HrLookupValueEdit() {
  const { lookupValueId } = useParams()
  const navigate = useNavigate()
  const typeRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupValueValues)
  const [originalValues, setOriginalValues] = useState(initialHrLookupValueValues)
  const [typeOptions, setTypeOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions } = useBusinessOptions('', {
    loadUnits: false,
    preserveGroupId: values.BG_ID,
  })

  useEffect(() => {
    let active = true
    Promise.all([hrLookupValuesApi.get(lookupValueId), hrLookupTypesApi.list()])
      .then(([record, types]) => {
        if (!active) return
        const mapped = mapHrLookupValueFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setTypeOptions(types
          .filter((type) => (
            String(type.status ?? 1) === '1' || String(type.id) === mapped.TYPE_ID
          ))
          .map((type) => ({ value: String(type.id), label: type.typeName })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load HR Lookup Value.'))
      })
    return () => {
      active = false
    }
  }, [lookupValueId])

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
      await hrLookupValuesApi.update(lookupValueId, mapHrLookupValueToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update HR Lookup Value.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Value Edit'}
      listTo={listPath}
      tableName={LOOKUP_VALUE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
      submitting={submitting}
      message={message}
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

export default HrLookupValueEdit
