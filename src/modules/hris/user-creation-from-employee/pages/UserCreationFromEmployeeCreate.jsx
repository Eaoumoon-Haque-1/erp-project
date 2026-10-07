/**
 * @file Create-page controller for User Creation From Employee.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormPage from '../../../../components/shared/FormPage'
import UserCreationFromEmployeeForm from '../components/UserCreationFromEmployeeForm'
import {
  USER_CREATION_FROM_EMPLOYEE_TABLE,
  initialUserCreationFromEmployeeValues,
  mockRoleOptions,
  mockUserTypeOptions,
  sampleEmployeesMap,
  validateUserCreationFromEmployee,
} from '../validation/userCreationFromEmployeeValidation'

function createEmployeeValues(employeeId) {
  const emp = sampleEmployeesMap[employeeId]
  return {
    ...initialUserCreationFromEmployeeValues,
    EMPLOYEE_ID: emp?.EMPLOYEE_ID || 'EMP-0101',
    EMPLOYEE_NAME: emp?.EMPLOYEE_NAME || 'Samira Rahman',
    BUSINESS_UNIT_NAME: emp?.BUSINESS_UNIT_NAME || 'Head Office',
    USER_NAME: emp?.SUGGESTED_USERNAME || 'srahman',
  }
}

function UserCreationFromEmployeeCreate() {
  const navigate = useNavigate()
  const { employeeId } = useParams()
  const [values, setValues] = useState(() => createEmployeeValues(employeeId))
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    if (!event || !event.target) return
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({ ...current, [name]: nextValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateUserCreationFromEmployee(values)
    setValues(result.values)
    setErrors(result.errors)

    if (!result.isValid) {
      return
    }

    // On successful creation, navigate back to employee informations list
    navigate('/hris/hris-forms/employee-information')
  }

  const handleReset = () => {
    setValues(createEmployeeValues(employeeId))
    setErrors({})
  }

  return (
    <FormPage
      title={'User Creation From Employee'}
      listTo={'/hris/hris-forms/employee-information'}
      tableName={USER_CREATION_FROM_EMPLOYEE_TABLE}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <UserCreationFromEmployeeForm values={values} errors={errors} roleOptions={mockRoleOptions} userTypeOptions={mockUserTypeOptions} onChange={handleChange} />
    </FormPage>
  )
}

export default UserCreationFromEmployeeCreate
