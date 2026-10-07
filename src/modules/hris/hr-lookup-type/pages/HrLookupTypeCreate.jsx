/**
 * @file Create-page controller for HR Lookup Type.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import HrLookupTypeForm from '../components/HrLookupTypeForm'
import {
  LOOKUP_TYPE_TABLE,
  initialHrLookupTypeValues,
  validateHrLookupType,
} from '../validation/hrLookupTypeValidation'

const existingTypeNames = []
const existingCodes = []

function HrLookupTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialHrLookupTypeValues)
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateHrLookupType(values, existingTypeNames, existingCodes)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }

    navigate('/hris/hr-lookup-settings/hr-lookup-type')
  }

  const handleReset = () => {
    setValues(initialHrLookupTypeValues)
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'HR Lookup Type Create'}
      listTo={'/hris/hr-lookup-settings/hr-lookup-type'}
      tableName={LOOKUP_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
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
