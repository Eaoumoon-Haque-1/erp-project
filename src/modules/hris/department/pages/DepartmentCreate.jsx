/**
 * @file Create-page controller for Department.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import DepartmentForm from '../components/DepartmentForm'
import {
  DEPARTMENT_TABLE,
  initialDepartmentValues,
  temporaryDepartmentBusinessGroup,
  validateDepartment,
} from '../validation/departmentValidation'

/**
 * REFERENCE CREATE PAGE
 *
 * Copy this page structure for a normal create form. The page owns state,
 * validation, focus, navigation, and future API calls. DepartmentForm only
 * renders controls and reports changes through props.
 */
function DepartmentCreate() {
  const navigate = useNavigate()

  // Controlled form values and field-keyed errors live together in the page.
  // A ref is used to return focus to the main field after reset/error.
  const [values, setValues] = useState(initialDepartmentValues)
  const [errors, setErrors] = useState({})
  const departmentNameRef = useRef(null)

  // Every input `name` must match a key in initialDepartmentValues and the
  // backend payload. Switches are converted to the project's "1"/"0" flags.
  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Validation returns normalized values as well as errors. Store both so
    // trimmed/coerced values are what a later API request would submit.
    const result = validateDepartment(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.DEPARTMENT_NAME) departmentNameRef.current?.focus()
      return
    }

    // Future API call belongs here. Navigate only after that request succeeds.
    navigate('/hris/employee-settings/department')
  }

  // Reset both values and errors; requestAnimationFrame waits until React has
  // rendered the reset value before focus is moved.
  const handleReset = () => {
    setValues(initialDepartmentValues)
    setErrors({})
    requestAnimationFrame(() => departmentNameRef.current?.focus())
  }

  return (
    // FormPage supplies the standard header/card/List/Reset/Save shell.
    // data-table receives the exact spreadsheet/backend table constant.
    <FormPage
      title={'Department Create'}
      listTo={'/hris/employee-settings/department'}
      tableName={DEPARTMENT_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {/* Keep field markup in a separate component so Create/Edit can reuse it. */}
      <DepartmentForm
        values={values}
        errors={errors}
        businessGroup={temporaryDepartmentBusinessGroup}
        onChange={handleChange}
        departmentNameRef={departmentNameRef}
      />
    </FormPage>
  )
}

export default DepartmentCreate
