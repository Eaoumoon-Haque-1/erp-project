/**
 * @file Create-page controller for Designation.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import DesignationForm from '../components/DesignationForm'
import {
  DESIGNATION_TABLE,
  initialDesignationValues,
  temporaryDesignationBusinessGroup,
  validateDesignation,
} from '../validation/designationValidation'

function DesignationCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialDesignationValues)
  const [errors, setErrors] = useState({})
  const designationNameRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateDesignation(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.DESIGNATION_NAME) designationNameRef.current?.focus()
      return
    }

    navigate('/hris/employee-settings/designation')
  }

  const handleReset = () => {
    setValues(initialDesignationValues)
    setErrors({})
    requestAnimationFrame(() => designationNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Designation Create'}
      listTo={'/hris/employee-settings/designation'}
      tableName={DESIGNATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <DesignationForm
        values={values}
        errors={errors}
        businessGroup={temporaryDesignationBusinessGroup}
        onChange={handleChange}
        designationNameRef={designationNameRef}
      />
    </FormPage>
  )
}

export default DesignationCreate
