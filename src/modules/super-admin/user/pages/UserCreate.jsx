/**
 * @file Create-page controller for User.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../../../app/currentUser'
import { businessUnitsApi, rolesApi, usersApi, userTypesApi } from '../../../../api/endpoints'
import { getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserAssignmentTabs from '../../../../components/shared/UserAssignmentTabs'
import {
  mockBusinessUnitOptions,
  mockEmployeeListOptions,
} from '../../../hris/assign-empl-bu-user/validation/assignEmplBuUserValidation'
import UserForm from '../components/UserForm'
import { mapUserToApi } from '../data/userApiMapper'
import {
  USER_TABLE,
  createInitialUserValues,
  getUserValidityToDate,
  validateUser,
} from '../validation/userValidation'

const existingUserNames = []
const existingMobileNumbers = []
const listPath = '/super-admin/user-creation/user'

function UserCreate() {
  const navigate = useNavigate()
  const userNameRef = useRef(null)
  const [values, setValues] = useState(() => createInitialUserValues(currentUser.businessGroup.id))
  const [errors, setErrors] = useState({})
  const [activeAssignmentTab, setActiveAssignmentTab] = useState('employee')
  const [employeeRows, setEmployeeRows] = useState([])
  const [businessUnitRows, setBusinessUnitRows] = useState([])
  const [businessUnitOptions, setBusinessUnitOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      businessUnitsApi.listByGroup(currentUser.businessGroup.id),
      rolesApi.list(),
      userTypesApi.list(),
    ])
      .then(([units, roles, userTypes]) => {
        if (!active) return
        setBusinessUnitOptions(units.map((unit) => ({ value: String(unit.id), label: unit.businessUnit })))
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.userType })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User options.'))
      })
    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    const nextValue = type === 'checkbox' ? (checked ? '1' : '0') : value
    setValues((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === 'FROM_DATE'
        ? { TO_DATE: getUserValidityToDate(nextValue) }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'FROM_DATE' ? { TO_DATE: undefined } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUser(values, existingUserNames, existingMobileNumbers)
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid=true]')?.focus())
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      await usersApi.create(mapUserToApi(result.values))
      navigate(listPath)
    } catch (error) {
      const apiMessage = getApiErrorMessage(error, 'Unable to create User.')
      if (/email/i.test(apiMessage)) {
        setErrors((current) => ({ ...current, EMAIL: apiMessage }))
        requestAnimationFrame(() => document.querySelector('[name="EMAIL"]')?.focus())
      } else {
        setMessage(apiMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(createInitialUserValues(currentUser.businessGroup.id))
    setErrors({})
    setActiveAssignmentTab('employee')
    setEmployeeRows([])
    setBusinessUnitRows([])
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Create'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} messageTone={'error'} submitting={submitting}>
      <UserForm values={values} errors={errors} groupName={currentUser.businessGroup.name} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} onChange={handleChange} />
      <UserAssignmentTabs
        employeeOptions={mockEmployeeListOptions}
        businessUnitOptions={mockBusinessUnitOptions}
        employeeRows={employeeRows}
        businessUnitRows={businessUnitRows}
        activeTab={activeAssignmentTab}
        generalError={errors.ASSIGNMENTS}
        onTabChange={setActiveAssignmentTab}
        onAddEmployee={(row) => {
          setEmployeeRows((current) => [...current, row])
          setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
        }}
        onRemoveEmployee={(indexToRemove) =>
          setEmployeeRows((current) =>
            current.filter((_, index) => index !== indexToRemove),
          )
        }
        onAddBusinessUnit={(row) => {
          setBusinessUnitRows((current) => [...current, row])
          setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
        }}
        onRemoveBusinessUnit={(indexToRemove) =>
          setBusinessUnitRows((current) =>
            current.filter((_, index) => index !== indexToRemove),
          )
        }
      />
    </FormPage>
  )
}

export default UserCreate
