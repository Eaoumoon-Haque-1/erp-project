/**
 * @file Create-page controller for User.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { usersApi } from '../api/userApi'
import { applyApiFormErrors, getApiErrorMessage } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserAssignmentTabs from '../../../../components/shared/UserAssignmentTabs'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import { mockEmployeeListOptions } from '../../../hris/assign-empl-bu-user/validation/assignEmplBuUserValidation'
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
  const [values, setValues] = useState(() => createInitialUserValues())
  const [errors, setErrors] = useState({})
  const [activeAssignmentTab, setActiveAssignmentTab] = useState('employee')
  const [employeeRows, setEmployeeRows] = useState([])
  const [businessUnitRows, setBusinessUnitRows] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  } = useBusinessOptions(values.BG_ID)

  useEffect(() => {
    let active = true
    Promise.all([
      rolesApi.list(),
      userTypesApi.list(),
    ])
      .then(([roles, userTypes]) => {
        if (!active) return
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
      ...(name === 'BG_ID' ? { BU_ID: '' } : {}),
      ...(name === 'FROM_DATE'
        ? { TO_DATE: getUserValidityToDate(nextValue) }
        : {}),
    }))
    if (name === 'BG_ID') setBusinessUnitRows([])
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BG_ID' ? { BU_ID: undefined } : {}),
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
      const apiMessage = applyApiFormErrors(error, setErrors, 'Unable to create User.')
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
    setValues(createInitialUserValues())
    setErrors({})
    setActiveAssignmentTab('employee')
    setEmployeeRows([])
    setBusinessUnitRows([])
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Create'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} messageTone={'error'} submitting={submitting}>
      <UserForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} unitsLoading={unitsLoading} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} onChange={handleChange} />
      <UserAssignmentTabs
        employeeOptions={mockEmployeeListOptions}
        businessUnitOptions={businessUnitOptions}
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
