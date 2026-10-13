/** @file API-backed User edit page using documented User CRUD fields. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
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
import { mapUserFromApi, mapUserToApi } from '../data/userApiMapper'
import {
  mapAssignedBusinessUnits,
  mapAssignedEmployee,
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

const listPath = '/super-admin/user-creation/user'

async function loadOptionalAssignment(request) {
  try {
    return await request
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

function UserEdit() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const userNameRef = useRef(null)
  const initialValues = createInitialUserValues()
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [originalRecord, setOriginalRecord] = useState({})
  const [activeAssignmentTab, setActiveAssignmentTab] = useState('employee')
  const [employeeRows, setEmployeeRows] = useState([])
  const [originalEmployeeRows, setOriginalEmployeeRows] = useState([])
  const [businessUnitRows, setBusinessUnitRows] = useState([])
  const [originalBusinessUnitRows, setOriginalBusinessUnitRows] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  } = useBusinessOptions(values.BG_ID, {
    preserveGroupId: originalValues.BG_ID,
    preserveUnitId: originalValues.BU_ID,
  })

  useEffect(() => {
    let active = true
    Promise.all([
      usersApi.get(userId),
      rolesApi.list(),
      userTypesApi.list(),
      employeesApi.list(),
      loadOptionalAssignment(userAssignmentsApi.getEmployee(userId)),
      loadOptionalAssignment(userAssignmentsApi.getBusinessUnits(userId)),
      businessUnitsApi.list(),
    ])
      .then(async ([user, roles, userTypes, employees, employeeAssignment, unitAssignments, units]) => {
        const unit = user.buId ? await businessUnitsApi.get(user.buId) : null
        if (!active) return
        const mapped = mapUserFromApi(user, {
          businessGroupId: unit?.bgId,
        })
        setValues(mapped)
        setOriginalValues(mapped)
        setOriginalRecord(user)
        const nextEmployeeRows = mapAssignedEmployee(employeeAssignment)
        const unitNames = new Map(units.map((record) => [String(record.id), record.businessUnit]))
        const nextBusinessUnitRows = mapAssignedBusinessUnits(unitAssignments, unitNames)
        setEmployeeRows(nextEmployeeRows)
        setOriginalEmployeeRows(nextEmployeeRows)
        setBusinessUnitRows(nextBusinessUnitRows)
        setOriginalBusinessUnitRows(nextBusinessUnitRows)
        setEmployeeOptions(mapEmployeeOptions(employees))
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.typeName })))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User.'))
      })
    return () => {
      active = false
    }
  }, [userId])

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
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateUser(values, [], [], { requirePassword: false })
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return
    setSubmitting(true)
    setMessage('')
    try {
      await usersApi.update(userId, mapUserToApi(result.values, originalRecord))
      try {
        await Promise.all([
          userAssignmentsApi.saveEmployee(
            userId,
            mapEmployeeAssignmentToApi(employeeRows),
          ),
          userAssignmentsApi.saveBusinessUnits(
            userId,
            mapBusinessUnitAssignmentsToApi(userId, result.values.BG_ID, businessUnitRows),
          ),
        ])
      } catch (assignmentError) {
        const detail = normalizeApiError(assignmentError, 'Unable to save User assignments.').message
        const partialMessage = `The User was updated, but its Employee or Business Unit assignments were not fully saved. ${detail}`
        setMessage(getApiErrorMessage(new Error(partialMessage), partialMessage))
        return
      }
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update User.', {
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
    setValues(originalValues)
    setEmployeeRows(originalEmployeeRows)
    setBusinessUnitRows(originalBusinessUnitRows)
    setActiveAssignmentTab('employee')
    setErrors({})
    setMessage('')
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Edit'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} message={message} messageTone={'error'} submitting={submitting}>
      <UserForm values={values} errors={errors} groupOptions={groupOptions} groupsLoading={groupsLoading} unitsLoading={unitsLoading} userNameRef={userNameRef} businessUnitOptions={businessUnitOptions} roleOptions={roleOptions} userTypeOptions={userTypeOptions} requirePassword={false} onChange={handleChange} />
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
          setEmployeeRows([row])
          setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
        }}
        onRemoveEmployee={() => setEmployeeRows([])}
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

export default UserEdit
