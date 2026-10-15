/** @file API-backed Leave Type assignment create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { leaveTypeGroupsApi } from '../api/leaveTypeGroupApi'
import LeaveTypeAssignForm from '../components/LeaveTypeAssignForm'
import { mapLeaveTypeAssignToApi } from '../data/leaveTypeAssignApiMapper'
import useLeaveTypeAssignOptions from '../hooks/useLeaveTypeAssignOptions'
import { LEAVE_TYPE_GROUP_TABLE, initialLeaveTypeAssignValues, validateLeaveTypeAssign } from '../validation/leaveTypeAssignValidation'

const listPath = '/hris/leave-settings/leave-type-assign'

function LeaveTypeAssignCreate() {
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(initialLeaveTypeAssignValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const options = useLeaveTypeAssignOptions(values)

  useEffect(() => {
    let active = true
    leaveTypeGroupsApi.list()
      .then((records) => { if (active) setExistingRecords(records) })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Leave Type assignments.')) })
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
      ...(name === 'BG_ID' ? { BU_ID: '', LEAVE_TYPE_ID: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateLeaveTypeAssign(values, existingRecords)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      if (result.errors.BU_ID) businessUnitRef.current?.focus()
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await leaveTypeGroupsApi.create(mapLeaveTypeAssignToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to assign Leave Type.', {
        bgId: 'BG_ID', buId: 'BU_ID', leaveTypeId: 'LEAVE_TYPE_ID', status: 'STATUS',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialLeaveTypeAssignValues)
    setErrors({})
    setMessage('')
  }

  return (
    <FormPage title={'Leave Type Assign Create'} listTo={listPath} tableName={LEAVE_TYPE_GROUP_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting} message={message}>
      <LeaveTypeAssignForm values={values} errors={errors} {...options} onChange={handleChange} businessUnitRef={businessUnitRef} />
    </FormPage>
  )
}

export default LeaveTypeAssignCreate
