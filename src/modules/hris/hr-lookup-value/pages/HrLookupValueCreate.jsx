/**
 * @file Create-page controller for HR Lookup Value.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import HrLookupValueForm from '../components/HrLookupValueForm'
import {
  LOOKUP_VALUE_TABLE,
  initialHrLookupValueValues,
  temporaryHrLookupTypeOptions,
  temporaryHrLookupValueBusinessGroup,
  validateHrLookupValue,
} from '../validation/hrLookupValueValidation'

function HrLookupValueCreate() {
  const navigate = useNavigate()
  const typeRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupValueValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateHrLookupValue(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    navigate('/hris/hr-lookup-settings/hr-lookup-value')
  }

  const handleReset = () => {
    setValues(initialHrLookupValueValues)
    setErrors({})
    requestAnimationFrame(() => typeRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Value Create'}
      listTo={'/hris/hr-lookup-settings/hr-lookup-value'}
      tableName={LOOKUP_VALUE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <HrLookupValueForm
        values={values}
        errors={errors}
        businessGroup={temporaryHrLookupValueBusinessGroup}
        hrLookupTypeOptions={temporaryHrLookupTypeOptions}
        typeRef={typeRef}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default HrLookupValueCreate
