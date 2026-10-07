/**
 * @file Create-page controller for Leave Type Assign.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import LeaveTypeAssignForm from '../components/LeaveTypeAssignForm'
import {
  LEAVE_TYPE_GROUP_TABLE,
  initialLeaveTypeAssignValues,
  temporaryLeaveTypeAssignBusinessGroup,
  temporaryLeaveTypeAssignBusinessUnits,
  temporarySelectedLeaveType,
  validateLeaveTypeAssign,
} from '../validation/leaveTypeAssignValidation'

function LeaveTypeAssignCreate() {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialLeaveTypeAssignValues)
  const [errors, setErrors] = useState({})
  const businessUnitRef = useRef(null)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value

    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateLeaveTypeAssign(values)

    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      return
    }

    navigate('/hris/leave-settings/leave-type-assign')
  }

  const handleReset = () => {
    setValues(initialLeaveTypeAssignValues)
    setErrors({})
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage
      title={'Leave Type Assign Create'}
      listTo={'/hris/leave-settings/leave-type-assign'}
      tableName={LEAVE_TYPE_GROUP_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <LeaveTypeAssignForm
        values={values}
        errors={errors}
        businessGroup={temporaryLeaveTypeAssignBusinessGroup}
        leaveType={temporarySelectedLeaveType}
        businessUnits={temporaryLeaveTypeAssignBusinessUnits}
        onChange={handleChange}
        businessUnitRef={businessUnitRef}
      />
    </FormPage>
  )
}

export default LeaveTypeAssignCreate
