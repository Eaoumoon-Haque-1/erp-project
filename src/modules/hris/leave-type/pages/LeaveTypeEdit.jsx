/** @file API-backed Leave Type edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { leaveTypesApi } from '../api/leaveTypeApi'
import LeaveTypeForm from '../components/LeaveTypeForm'
import { mapLeaveTypeFromApi, mapLeaveTypeToApi } from '../data/leaveTypeApiMapper'
import { LEAVE_TYPE_TABLE, initialLeaveTypeValues, validateLeaveType } from '../validation/leaveTypeValidation'

const listPath = '/hris/leave-settings/leave-type'

function LeaveTypeEdit() {
  const { leaveTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialLeaveTypeValues)
  const [originalValues, setOriginalValues] = useState(initialLeaveTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, { loadUnits: false, preserveGroupId: originalValues.BG_ID })

  useEffect(() => {
    let active = true
    Promise.all([leaveTypesApi.get(leaveTypeId), leaveTypesApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapLeaveTypeFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(leaveTypeId)))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Leave Type.')) })
    return () => { active = false }
  }, [leaveTypeId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateLeaveType(values, existingRecords)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await leaveTypesApi.update(leaveTypeId, mapLeaveTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Leave Type.', {
        bgId: 'BG_ID', typeName: 'TYPE_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(originalValues)
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Leave Type Edit'} listTo={listPath} tableName={LEAVE_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} submitting={submitting} message={message}>
      <LeaveTypeForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} onChange={handleChange} typeNameRef={typeNameRef} />
    </FormPage>
  )
}

export default LeaveTypeEdit
