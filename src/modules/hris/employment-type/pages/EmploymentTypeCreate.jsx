/**
 * @file Create-page controller for Employment Type.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import EmploymentTypeForm from '../components/EmploymentTypeForm'
import {
  EMPLOYMENT_TYPE_TABLE,
  initialEmploymentTypeValues,
  validateEmploymentType,
} from '../validation/employmentTypeValidation'

function EmploymentTypeCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialEmploymentTypeValues)
  const [errors, setErrors] = useState({})
  const typeNameRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateEmploymentType(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.TYPE_NAME) typeNameRef.current?.focus()
      return
    }

    navigate('/hris/employee-settings/employment-type')
  }

  const handleReset = () => {
    setValues(initialEmploymentTypeValues)
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Employment Type Create'}
      listTo={'/hris/employee-settings/employment-type'}
      tableName={EMPLOYMENT_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <EmploymentTypeForm
        values={values}
        errors={errors}
        onChange={handleChange}
        typeNameRef={typeNameRef}
      />
    </FormPage>
  )
}

export default EmploymentTypeCreate
