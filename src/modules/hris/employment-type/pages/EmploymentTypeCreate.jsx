/** @file API-backed Employment Type create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import { getNextSortOrder } from '../../../../utils/sortOrder'
import { employmentTypesApi } from '../api/employmentTypeApi'
import EmploymentTypeForm from '../components/EmploymentTypeForm'
import { mapEmploymentTypeToApi } from '../data/employmentTypeApiMapper'
import { EMPLOYMENT_TYPE_TABLE, initialEmploymentTypeValues, validateEmploymentType } from '../validation/employmentTypeValidation'

const listPath = '/hris/employee-settings/employment-type'

function EmploymentTypeCreate() {
  const navigate = useNavigate()
  const typeNameRef = useRef(null)
  const [values, setValues] = useState(initialEmploymentTypeValues)
  const [existingRecords, setExistingRecords] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    employmentTypesApi.list()
      .then((records) => {
        if (!active) return
        setExistingRecords(records)
        setValues((current) => ({
          ...current,
          SORT_ORDER: getNextSortOrder(records),
        }))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load existing Employment Types.'))
      })
    return () => { active = false }
  }, [])

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
    if (!result.isValid) {
      if (result.errors.TYPE_NAME) typeNameRef.current?.focus()
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      await employmentTypesApi.create(mapEmploymentTypeToApi(result.values))
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to create Employment Type.', {
        typeName: 'TYPE_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues({
      ...initialEmploymentTypeValues,
      SORT_ORDER: getNextSortOrder(existingRecords),
    })
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => typeNameRef.current?.focus())
  }

  return (
    <FormPage title={'Employment Type Create'} listTo={listPath} tableName={EMPLOYMENT_TYPE_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting} message={message}>
      <EmploymentTypeForm values={values} errors={errors} onChange={handleChange} typeNameRef={typeNameRef} />
    </FormPage>
  )
}

export default EmploymentTypeCreate
