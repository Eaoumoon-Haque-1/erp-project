/**
 * @file Create-page controller for Employment Status.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import EmploymentStatusForm from '../components/EmploymentStatusForm'
import {
  EMPLOYMENT_STATUS_TABLE,
  initialEmploymentStatusValues,
  validateEmploymentStatus,
} from '../validation/employmentStatusValidation'

function EmploymentStatusCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialEmploymentStatusValues)
  const [errors, setErrors] = useState({})
  const statusNameRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateEmploymentStatus(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.STATUS_NAME) statusNameRef.current?.focus()
      return
    }

    navigate('/hris/employee-settings/employment-status')
  }

  const handleReset = () => {
    setValues(initialEmploymentStatusValues)
    setErrors({})
    requestAnimationFrame(() => statusNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Employment Status Create'}
      listTo={'/hris/employee-settings/employment-status'}
      tableName={EMPLOYMENT_STATUS_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <EmploymentStatusForm
        values={values}
        errors={errors}
        onChange={handleChange}
        statusNameRef={statusNameRef}
      />
    </FormPage>
  )
}

export default EmploymentStatusCreate
