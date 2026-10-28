/** @file API-backed Leave Type create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { leaveTypesApi } from '../api/leaveTypeApi'
import LeaveTypeForm from '../components/LeaveTypeForm'
import { mapLeaveTypeToApi } from '../data/leaveTypeApiMapper'
import { LEAVE_TYPE_TABLE, initialLeaveTypeValues, validateLeaveType } from '../validation/leaveTypeValidation'

const listPath = '/hris/leave-settings/leave-type'

function LeaveTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialLeaveTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, { loadUnits: false })

  useEffect(() => {
    let active = true
    leaveTypesApi.list()
      .then((records) => {
        if (!active) return
        setExistingRecords(records)
        setValues((current) => ({
          ...current,
          SORT_ORDER: getNextSortOrder(records),
        }))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Leave Types.')) })
    return () => { active = false }
  }, [])

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
    if (!result.isValid) {
      if (result.errors.TYPE_NAME) typeNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await leaveTypesApi.create(mapLeaveTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Leave Type.', {
        bgId: 'BG_ID', typeName: 'TYPE_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialLeaveTypeValues,
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Leave Type Create'} listTo={listPath} tableName={LEAVE_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting} message={message}>
      <LeaveTypeForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} onChange={handleChange} typeNameRef={typeNameRef} />
    </FormPage>
  )
}

export default LeaveTypeCreate
