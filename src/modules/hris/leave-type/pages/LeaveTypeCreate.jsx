/**
 * @file Create-page controller for Leave Type.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import LeaveTypeForm from '../components/LeaveTypeForm'
import {
  LEAVE_TYPE_TABLE,
  initialLeaveTypeValues,
  temporaryLeaveTypeBusinessGroup,
  validateLeaveType,
} from '../validation/leaveTypeValidation'

function LeaveTypeCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialLeaveTypeValues)
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
    const result = validateLeaveType(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.TYPE_NAME) typeNameRef.current?.focus()
      return
    }

    navigate('/hris/leave-settings/leave-type')
  }

  const handleReset = () => {
    setValues(initialLeaveTypeValues)
    setErrors({})
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage
      title={'Leave Type Create'}
      listTo={'/hris/leave-settings/leave-type'}
      tableName={LEAVE_TYPE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <LeaveTypeForm
        values={values}
        errors={errors}
        businessGroup={temporaryLeaveTypeBusinessGroup}
        onChange={handleChange}
        typeNameRef={typeNameRef}
      />
    </FormPage>
  )
}

export default LeaveTypeCreate
