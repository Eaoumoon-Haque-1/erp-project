/**
 * @file Create-page controller for User.
 * Sections: controlled state/refs, change handlers, validation submit/reset, and form-page composition.
 * Future create API calls belong here; keep field markup in the matching form component.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../api/userApi'
import { userAssignmentsApi } from '../api/userAssignmentApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { applyApiFormErrors, getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserAssignmentTabs from '../../../../components/shared/UserAssignmentTabs'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import useBusinessUnitRoleOptions from '../../../../hooks/useBusinessUnitRoleOptions'
import UserForm from '../components/UserForm'
import { mapUserToApi } from '../data/userApiMapper'
import {
  mapBusinessUnitAssignmentsToApi,
  mapEmployeeOptions,
} from '../data/userAssignmentApiMapper'
import {
  loadUserEmployeeHistory,
  removeUserEmployeeHistory,
  saveUserEmployeeHistory,
  USER_CREATE_HISTORY_KEY,
} from '../data/userEmployeeHistoryStorage'
import {
  addEmployeeHistoryRow,
  applyUserStatusToEmployeeRows,
  closeCurrentEmployee,
} from '../data/userEmployeeHistory'
import {
  filterUserTypesByBusinessUnit,
  isUserTypeAvailableForBusinessUnit,
  loadUserTypeBusinessUnitOptions,
} from '../data/userTypeBusinessUnitOptions'
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
  const [employeeRows, setEmployeeRows] = useState(() =>
    loadUserEmployeeHistory(USER_CREATE_HISTORY_KEY))
  const [businessUnitRows, setBusinessUnitRows] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [createdUserId, setCreatedUserId] = useState('')
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [userTypesLoading, setUserTypesLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const {
    groupOptions,
    businessUnitOptions,
    groupsLoading,
    unitsLoading,
  } = useBusinessOptions(values.BG_ID)
  const { roleOptions, rolesLoading, rolesError } = useBusinessUnitRoleOptions(values.BU_ID)

  useEffect(() => {
    saveUserEmployeeHistory(USER_CREATE_HISTORY_KEY, employeeRows)
  }, [employeeRows])

  useEffect(() => {
    let active = true
    Promise.all([
      loadUserTypeBusinessUnitOptions(),
      employeesApi.list(),
    ])
      .then(([userTypes, employees]) => {
        if (!active) return
        setUserTypeOptions(userTypes)
        setEmployeeOptions(mapEmployeeOptions(employees))
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User options.'))
      })
      .finally(() => { if (active) setUserTypesLoading(false) })
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
      ...(name === 'BG_ID' ? { BU_ID: '', ROLE_ID: '' } : {}),
      ...(name === 'BU_ID' ? { ROLE_ID: '' } : {}),
      ...(name === 'BG_ID' || (name === 'BU_ID' && !isUserTypeAvailableForBusinessUnit(
        userTypeOptions,
        current.USER_TYPE_ID,
        nextValue,
      )) ? { USER_TYPE_ID: '' } : {}),
      ...(name === 'FROM_DATE'
        ? { TO_DATE: getUserValidityToDate(nextValue) }
        : {}),
    }))
    if (name === 'BG_ID') {
      setBusinessUnitRows([])
      setEmployeeRows([])
    }
    if (name === 'BU_ID') {
      const selectedUnit = businessUnitOptions.find((option) => option.value === nextValue)
      if (selectedUnit) {
        setBusinessUnitRows((current) => {
          const existing = current.find((row) => row.BU_ID === nextValue)
          if (existing) {
            return current.map((row) => row.BU_ID === nextValue
              ? { ...row, STATUS: '1' }
              : row)
          }
          return [...current, {
            id: `business-unit-map-${Date.now()}`,
            MAPPING_ID: null,
            BU_ID: nextValue,
            NAME: selectedUnit.label,
            STATUS: '1',
          }]
        })
      }
      setEmployeeRows((current) => closeCurrentEmployee(current, nextValue))
    }
    if (name === 'STATUS') {
      setEmployeeRows((current) => applyUserStatusToEmployeeRows(current, nextValue))
    }
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BG_ID' ? { BU_ID: undefined, ROLE_ID: undefined } : {}),
      ...(name === 'BU_ID' ? { ROLE_ID: undefined } : {}),
      ...((name === 'BG_ID' || name === 'BU_ID') ? { USER_TYPE_ID: undefined } : {}),
      ...(name === 'FROM_DATE' ? { TO_DATE: undefined } : {}),
    }))
  }

  const visibleEmployeeOptions = values.BU_ID
    ? employeeOptions.filter((option) => option.buId === values.BU_ID)
    : []
  const visibleUserTypeOptions = filterUserTypesByBusinessUnit(userTypeOptions, values.BU_ID)
  const selectedEmployee = employeeRows.find((row) => row.IS_CURRENT === '1')

  const stageEmployee = (row) => {
    if (!row || employeeRows.some((employee) => (
      employee.EMPL_ID === row.EMPL_ID && String(employee.STATUS) === '1'
    ))) return
    setEmployeeRows((current) => addEmployeeHistoryRow(
      createdUserId ? current : [],
      row,
      values.STATUS,
    ))
    setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const valuesWithEligibleRole = values.ROLE_ID
      && !roleOptions.some((option) => option.value === values.ROLE_ID)
      ? { ...values, ROLE_ID: '' }
      : values
    const result = validateUser(valuesWithEligibleRole, existingUserNames, existingMobileNumbers)
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
        ? await usersApi.update(createdUserId, mapUserToApi(result.values, selectedEmployee))
        : await usersApi.create(mapUserToApi(result.values, selectedEmployee))
      const userId = String(savedUser?.id ?? createdUserId)
      if (!userId) throw new Error('The User was saved without returning its ID, so assignments could not be saved.')
      if (!createdUserId) setCreatedUserId(userId)
      saveUserEmployeeHistory(userId, employeeRows)
      removeUserEmployeeHistory(USER_CREATE_HISTORY_KEY)

      try {
        const assignmentRequests = []
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
        employeeId: 'ASSIGNMENTS',
        deptId: 'ASSIGNMENTS',
        desigId: 'ASSIGNMENTS',
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
    removeUserEmployeeHistory(USER_CREATE_HISTORY_KEY)
    requestAnimationFrame(() => userNameRef.current?.focus())
  }

  return (
    <FormPage title={'User Create'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} message={rolesError ? getApiErrorMessage(rolesError, 'Unable to load Roles for this Business Unit.') : message} messageTone={'error'} submitting={submitting}>
      <UserForm
        values={values}
        errors={errors}
        groupOptions={groupOptions}
        groupsLoading={groupsLoading}
        unitsLoading={unitsLoading}
        userNameRef={userNameRef}
        businessUnitOptions={businessUnitOptions}
        roleOptions={roleOptions}
        rolesLoading={rolesLoading}
        userTypeOptions={visibleUserTypeOptions}
        userTypesLoading={userTypesLoading}
        employeeDisplayValue={selectedEmployee?.DISPLAY_NAME || ''}
        showEmployeeField
        requirePassword
        onChange={handleChange}
      />
      <UserAssignmentTabs
        employeeOptions={visibleEmployeeOptions}
        businessUnitOptions={businessUnitOptions}
        employeeRows={employeeRows}
        businessUnitRows={businessUnitRows}
        maxEmployeeAssignments={Number.POSITIVE_INFINITY}
        showEmployeeStatus={false}
        showEmployeeHistory
        activeTab={activeAssignmentTab}
        generalError={errors.ASSIGNMENTS}
        onTabChange={setActiveAssignmentTab}
        onAddEmployee={stageEmployee}
        onAddBusinessUnit={(row) => {
          setBusinessUnitRows((current) => [...current, row])
          if (!values.BU_ID) {
            setValues((current) => ({ ...current, BU_ID: row.BU_ID }))
          }
          setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
        }}
        onRemoveBusinessUnit={(indexToRemove) => {
          const removed = businessUnitRows[indexToRemove]
          const remaining = businessUnitRows.filter((_, index) => index !== indexToRemove)
          setBusinessUnitRows(remaining)
          if (removed?.BU_ID === values.BU_ID) {
            const nextMainUnitId = remaining.find((row) => row.STATUS === '1')?.BU_ID || ''
            setValues((current) => ({ ...current, BU_ID: nextMainUnitId }))
            setEmployeeRows((current) => closeCurrentEmployee(current, nextMainUnitId))
          }
        }}
      />
    </FormPage>
  )
}

export default UserCreate
