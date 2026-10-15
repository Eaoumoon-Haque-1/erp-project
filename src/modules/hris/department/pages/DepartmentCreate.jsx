/** @file API-backed Department create page. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { departmentsApi } from '../api/departmentApi'
import DepartmentForm from '../components/DepartmentForm'
import { mapDepartmentToApi } from '../data/departmentApiMapper'
import { DEPARTMENT_TABLE, initialDepartmentValues, validateDepartment } from '../validation/departmentValidation'

const listPath = '/hris/employee-settings/department'

function DepartmentCreate() {
  const navigate = useNavigate()
  const departmentNameRef = useRef(null)
  const [values, setValues] = useState(initialDepartmentValues)
  const [existingDepartments, setExistingDepartments] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, groupsLoading } = useBusinessOptions(values.BG_ID, { loadUnits: false })

  useEffect(() => {
    let active = true
    departmentsApi.list()
      .then((records) => { if (active) setExistingDepartments(records) })
      .catch((error) => {
        if (active) getApiErrorMessage(error, 'Unable to load existing Departments.')
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
    const result = validateDepartment(values, existingDepartments)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    try {
      await departmentsApi.create(mapDepartmentToApi(result.values))
      navigate(listPath)
    } catch (error) {
      applyApiFormErrors(error, setErrors, 'Unable to create Department.', {
        bgId: 'BG_ID', departmentName: 'DEPARTMENT_NAME', shortName: 'SHORT_NAME', sortOrder: 'SORT_ORDER', status: 'STATUS',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialDepartmentValues)
    setErrors({})
    requestAnimationFrame(() => departmentNameRef.current?.focus())
  }

  return (
    <FormPage title={'Department Create'} listTo={listPath} tableName={DEPARTMENT_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitting={submitting}>
      <DepartmentForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} onChange={handleChange} departmentNameRef={departmentNameRef} />
    </FormPage>
  )
}

export default DepartmentCreate
