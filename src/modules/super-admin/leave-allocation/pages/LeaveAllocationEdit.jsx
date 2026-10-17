/** @file API-backed Leave Allocation edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { leaveAllocationsApi } from '../api/leaveAllocationApi'
import LeaveAllocationForm from '../components/LeaveAllocationForm'
import {
  mapLeaveAllocationFromApi,
  mapLeaveAllocationToApi,
} from '../data/leaveAllocationApiMapper'
import useLeaveAllocationOptions from '../hooks/useLeaveAllocationOptions'
import {
  LEAVE_ALLOCATION_TABLE,
  initialLeaveAllocationValues,
  validateLeaveAllocation,
} from '../validation/leaveAllocationValidation'

const listPath = '/hris/leave-settings/leave-allocation'

function LeaveAllocationEdit() {
  const { leaveAllocationId } = useParams()
  const navigate = useNavigate()
  const firstFieldRef = useRef(null)
  const [values, setValues] = useState(initialLeaveAllocationValues)
  const [originalValues, setOriginalValues] = useState(initialLeaveAllocationValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const options = useLeaveAllocationOptions(values.BU_ID, {
    preserveBusinessUnitId: originalValues.BU_ID,
    preserveEmploymentTypeId: originalValues.EMP_TYPE_ID,
    preserveLeaveCategoryId: originalValues.LEAVE_CATEGORY_ID,
  })

  useEffect(() => {
    let active = true
    leaveAllocationsApi.get(leaveAllocationId)
      .then((record) => {
        if (!active) return
        const mapped = mapLeaveAllocationFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
      })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load Leave Allocation.')
      })
    return () => { active = false }
  }, [leaveAllocationId])

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
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await leaveAllocationsApi.update(
        leaveAllocationId,
        mapLeaveAllocationToApi(result.values),
      )
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Leave Allocation.', {
        buId: 'BU_ID', empTypeId: 'EMP_TYPE_ID', leaveCategoryId: 'LEAVE_CATEGORY_ID',
        totalLeaveDays: 'TOTAL_LEAVE_DAYS', leaveYear: 'LEAVE_YEAR',
        sandwichLeaveApplicable: 'SANDWICH_LEAVE_APPLICABLE', withPay: 'WITH_PAY', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    requestAnimationFrame(() => firstFieldRef.current?.focus())
  }

  return (
    <FormPage
      title={'Leave Allocation Edit'}
      listTo={listPath}
      tableName={LEAVE_ALLOCATION_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitLabel={'Update'}
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

export default LeaveAllocationEdit
