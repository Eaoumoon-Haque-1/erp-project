/** @file API-backed Employment Status edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import useAuth from '../../../../auth/useAuth'
import FormPage from '../../../../components/shared/FormPage'
import { employmentStatusesApi } from '../api/employmentStatusApi'
import EmploymentStatusForm from '../components/EmploymentStatusForm'
import { mapEmploymentStatusFromApi, mapEmploymentStatusToApi } from '../data/employmentStatusApiMapper'
import { EMPLOYMENT_STATUS_TABLE, initialEmploymentStatusValues, validateEmploymentStatus } from '../validation/employmentStatusValidation'

const listPath = '/hris/employee-settings/employment-status'
const fieldMap = {
  bgId: 'BG_ID', buId: 'BU_ID', statusName: 'STATUS_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
}

function EmploymentStatusEdit() {
  const { employmentStatusId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const sessionGroupId = String(session?.bgId ?? '')
  const sessionBusinessUnitId = String(session?.buId ?? '')
  const statusNameRef = useRef(null)
  const [values, setValues] = useState(initialEmploymentStatusValues)
  const [originalValues, setOriginalValues] = useState(initialEmploymentStatusValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([employmentStatusesApi.get(employmentStatusId), employmentStatusesApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = {
          ...mapEmploymentStatusFromApi(record),
          BG_ID: sessionGroupId,
          BU_ID: sessionBusinessUnitId,
        }
        setValues(mapped); setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(employmentStatusId)))
      })
      .catch((error) => getApiErrorMessage(error, 'Unable to load Employment Status.'))
    return () => { active = false }
  }, [employmentStatusId, sessionBusinessUnitId, sessionGroupId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateEmploymentStatus(
      {
        ...values,
        BG_ID: sessionGroupId,
        BU_ID: sessionBusinessUnitId,
      },
      existingRecords,
    )
    setValues(result.values); setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return false
    }
    setSubmitting(true)
    try {
      await employmentStatusesApi.update(employmentStatusId, mapEmploymentStatusToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to update Employment Status.', fieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(originalValues); setErrors({})
    requestAnimationFrame(() => statusNameRef.current?.focus())
  }

  return (
    <FormPage title={'Employment Status Edit'} listTo={listPath} tableName={EMPLOYMENT_STATUS_TABLE}
      onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} submitting={submitting}>
      <EmploymentStatusForm values={values} errors={errors} onChange={handleChange} statusNameRef={statusNameRef} />
    </FormPage>
  )
}

export default EmploymentStatusEdit
