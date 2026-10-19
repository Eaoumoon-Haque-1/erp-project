/** @file API-backed Employment Status create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { employmentStatusesApi } from '../api/employmentStatusApi'
import EmploymentStatusForm from '../components/EmploymentStatusForm'
import { mapEmploymentStatusToApi } from '../data/employmentStatusApiMapper'
import { EMPLOYMENT_STATUS_TABLE, initialEmploymentStatusValues, validateEmploymentStatus } from '../validation/employmentStatusValidation'

const listPath = '/hris/employee-settings/employment-status'
const fieldMap = {
  statusName: 'STATUS_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
}

function EmploymentStatusCreate() {
  const navigate = useNavigate()
  const statusNameRef = useRef(null)
  const [values, setValues] = useState(initialEmploymentStatusValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    employmentStatusesApi.list()
      .then((records) => { if (active) setExistingRecords(records) })
      .catch((error) => getApiErrorMessage(error, 'Unable to load existing Employment Statuses.'))
    return () => { active = false }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateEmploymentStatus(values, existingRecords)
    setValues(result.values); setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return false
    }
    setSubmitting(true)
    try {
      await employmentStatusesApi.create(mapEmploymentStatusToApi(result.values))
      navigate(listPath)
      return true
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Employment Status.', fieldMap)
      return false
    } finally { setSubmitting(false) }
  }

  const handleReset = () => {
    setValues(initialEmploymentStatusValues); setErrors({})
    requestAnimationFrame(() => statusNameRef.current?.focus())
  }

  return (
    <FormPage title={'Employment Status Create'} listTo={listPath} tableName={EMPLOYMENT_STATUS_TABLE}
      onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <EmploymentStatusForm values={values} errors={errors} onChange={handleChange} statusNameRef={statusNameRef} />
    </FormPage>
  )
}

export default EmploymentStatusCreate
