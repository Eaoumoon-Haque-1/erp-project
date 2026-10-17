/**
 * @file Create-page controller for Leave Allocation.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { leaveAllocationsApi } from '../api/leaveAllocationApi'
import LeaveAllocationForm from '../components/LeaveAllocationForm'
import { mapLeaveAllocationToApi } from '../data/leaveAllocationApiMapper'
import useLeaveAllocationOptions from '../hooks/useLeaveAllocationOptions'
import {
  LEAVE_ALLOCATION_TABLE,
  createInitialLeaveAllocationValues,
  validateLeaveAllocation,
} from '../validation/leaveAllocationValidation'

const listPath = '/hris/leave-settings/leave-allocation'

function LeaveAllocationCreate() {
  const navigate = useNavigate()
  const firstFieldRef = useRef(null)
  const [values, setValues] = useState(createInitialLeaveAllocationValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const options = useLeaveAllocationOptions(values.BU_ID)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'BU_ID' ? { LEAVE_CATEGORY_ID: '' } : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BU_ID' ? { LEAVE_CATEGORY_ID: undefined } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateLeaveAllocation(values)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"]')?.focus(),
      )
      return
    }

    setSubmitting(true)
    try {
      await leaveAllocationsApi.create(mapLeaveAllocationToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Leave Allocation.', {
        buId: 'BU_ID', empTypeId: 'EMP_TYPE_ID', leaveCategoryId: 'LEAVE_CATEGORY_ID',
        totalLeaveDays: 'TOTAL_LEAVE_DAYS', leaveYear: 'LEAVE_YEAR',
        sandwichLeaveApplicable: 'SANDWICH_LEAVE_APPLICABLE', withPay: 'WITH_PAY', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialLeaveAllocationValues())
    setErrors({})
    requestAnimationFrame(() => firstFieldRef.current?.focus())
  }

  return (
    <FormPage
      title={"Leave Allocation Create"}
      listTo={listPath}
      tableName={LEAVE_ALLOCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitting={submitting}
    >
      <LeaveAllocationForm
        values={values}
        errors={errors}
        firstFieldRef={firstFieldRef}
        businessUnitOptions={options.businessUnitOptions}
        employeeTypeOptions={options.employmentTypeOptions}
        leaveCategoryOptions={options.leaveCategoryOptions}
        optionsLoading={options.loading}
        onChange={handleChange}
      />
    </FormPage>
  )
}

export default LeaveAllocationCreate
