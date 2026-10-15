/** @file API-backed Employment Type edit page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { employmentTypesApi } from '../api/employmentTypeApi'
import EmploymentTypeForm from '../components/EmploymentTypeForm'
import { mapEmploymentTypeFromApi, mapEmploymentTypeToApi } from '../data/employmentTypeApiMapper'
import { EMPLOYMENT_TYPE_TABLE, initialEmploymentTypeValues, validateEmploymentType } from '../validation/employmentTypeValidation'

const listPath = '/hris/employee-settings/employment-type'

function EmploymentTypeEdit() {
  const { employmentTypeId } = useParams()
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialEmploymentTypeValues)
  const [originalValues, setOriginalValues] = useState(initialEmploymentTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([employmentTypesApi.get(employmentTypeId), employmentTypesApi.list()])
      .then(([record, records]) => {
        if (!active) return
        const mapped = mapEmploymentTypeFromApi(record)
        setValues(mapped)
        setOriginalValues(mapped)
        setExistingRecords(records.filter((item) => String(item.id) !== String(employmentTypeId)))
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load Employment Type.')) })
    return () => { active = false }
  }, [employmentTypeId])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? (checked ? '1' : '0') : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateEmploymentType(values, existingRecords)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    try {
      await employmentTypesApi.update(employmentTypeId, mapEmploymentTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update Employment Type.', {
        typeName: 'TYPE_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
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
    <FormPage title={'Employment Type Edit'} listTo={listPath} tableName={EMPLOYMENT_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} submitting={submitting} message={message}>
      <EmploymentTypeForm values={values} errors={errors} onChange={handleChange} typeNameRef={typeNameRef} />
    </FormPage>
  )
}

export default EmploymentTypeEdit
