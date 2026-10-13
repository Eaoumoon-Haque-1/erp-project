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
import { userAssignmentsApi } from '../api/userAssignmentApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { applyApiFormErrors, getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserAssignmentTabs from '../../../../components/shared/UserAssignmentTabs'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import UserForm from '../components/UserForm'
import { mapUserToApi } from '../data/userApiMapper'
import {
  mapBusinessUnitAssignmentsToApi,
  mapEmployeeAssignmentToApi,
  mapEmployeeOptions,
} from '../data/userAssignmentApiMapper'
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
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [createdUserId, setCreatedUserId] = useState('')
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
      employeesApi.list(),
    ])
      .then(([roles, userTypes, employees]) => {
        if (!active) return
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.typeName })))
        setEmployeeOptions(mapEmployeeOptions(employees))
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
      const savedUser = createdUserId
        ? await usersApi.update(createdUserId, mapUserToApi(result.values))
        : await usersApi.create(mapUserToApi(result.values))
      const userId = String(savedUser?.id ?? createdUserId)
      if (!userId) throw new Error('The User was saved without returning its ID, so assignments could not be saved.')
      if (!createdUserId) setCreatedUserId(userId)

      try {
        const assignmentRequests = []
        if (employeeRows.length > 0) {
          assignmentRequests.push(userAssignmentsApi.saveEmployee(
            userId,
            mapEmployeeAssignmentToApi(employeeRows),
          ))
        }
        if (businessUnitRows.length > 0) {
          assignmentRequests.push(userAssignmentsApi.saveBusinessUnits(
            userId,
            mapBusinessUnitAssignmentsToApi(userId, result.values.BG_ID, businessUnitRows),
          ))
        }
        await Promise.all(assignmentRequests)
      } catch (assignmentError) {
        const detail = normalizeApiError(assignmentError, 'Unable to save User assignments.').message
        const partialMessage = `The User was saved, but its Employee or Business Unit assignments were not fully saved. ${detail}`
        setMessage(getApiErrorMessage(new Error(partialMessage), partialMessage))
        return
      }
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, error.response ? 'Unable to create User.' : error.message || 'Unable to create User.', {
        userName: 'USER_NAME',
        fullName: 'FULL_NAME',
        bgId: 'BG_ID',
        buId: 'BU_ID',
        businessGroup: 'BG_ID',
        businessUnit: 'BU_ID',
        email: 'EMAIL',
        mobileNo: 'MOBILE_NO',
        password: 'PASSWORD',
        fromDate: 'FROM_DATE',
        toDate: 'TO_DATE',
        roleId: 'ROLE_ID',
        userTypeId: 'USER_TYPE_ID',
        androidId: 'ANDROID_ID',
      }))
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
    setCreatedUserId('')
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Create'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={message} messageTone={'error'} submitting={submitting}>
      <UserForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} unitsLoading={unitsLoading} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} requirePassword onChange={handleChange} />
      <UserAssignmentTabs
        employeeOptions={employeeOptions.filter((option) => !values.BG_ID || option.bgId === values.BG_ID)}
        businessUnitOptions={businessUnitOptions}
        employeeRows={employeeRows}
        businessUnitRows={businessUnitRows}
        maxEmployeeAssignments={1}
        showEmployeeStatus={false}
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
