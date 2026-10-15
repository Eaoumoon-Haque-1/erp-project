/** @file API-backed Leave Type assignment edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { leaveTypeGroupsApi } from '../api/leaveTypeGroupApi'
import LeaveTypeAssignForm from '../components/LeaveTypeAssignForm'
import { mapLeaveTypeAssignFromApi, mapLeaveTypeAssignToApi } from '../data/leaveTypeAssignApiMapper'
import useLeaveTypeAssignOptions from '../hooks/useLeaveTypeAssignOptions'
import { LEAVE_TYPE_GROUP_TABLE, initialLeaveTypeAssignValues, validateLeaveTypeAssign } from '../validation/leaveTypeAssignValidation'

const listPath = '/hris/leave-settings/leave-type-assign'

function LeaveTypeAssignEdit() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const businessUnitRef = useRef(null)
  const [values, setValues] = useState(initialLeaveTypeAssignValues)
  const [originalValues, setOriginalValues] = useState(initialLeaveTypeAssignValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const options = useLeaveTypeAssignOptions(values, originalValues)

  useEffect(() => {
    let active = true
    Promise.all([leaveTypeGroupsApi.get(assignmentId), leaveTypeGroupsApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapLeaveTypeAssignFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(assignmentId)))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Leave Type assignment.')) })
    return () => { active = false }
  }, [assignmentId])

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
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await leaveTypeGroupsApi.update(assignmentId, mapLeaveTypeAssignToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Leave Type assignment.', {
        bgId: 'BG_ID', buId: 'BU_ID', leaveTypeId: 'LEAVE_TYPE_ID', status: 'STATUS',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => businessUnitRef.current?.focus())
  }

  return (
    <FormPage title={'Leave Type Assign Edit'} listTo={listPath} tableName={LEAVE_TYPE_GROUP_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} submitting={submitting} message={message}>
      <LeaveTypeAssignForm values={values} errors={errors} {...options} onChange={handleChange} businessUnitRef={businessUnitRef} />
    </FormPage>
  )
}

export default LeaveTypeAssignEdit
