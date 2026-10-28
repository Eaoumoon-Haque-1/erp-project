/** @file API-backed User edit page using the current User and BU assignment contracts. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyApiFormErrors, getApiErrorMessage, normalizeApiError } from '../../../../api/errors'
import FormPage from '../../../../components/shared/FormPage'
import UserAssignmentTabs from '../../../../components/shared/UserAssignmentTabs'
import useBusinessOptions from '../../../../hooks/useBusinessOptions'
import useBusinessUnitRoleOptions from '../../../../hooks/useBusinessUnitRoleOptions'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { usersApi } from '../api/userApi'
import { userAssignmentsApi } from '../api/userAssignmentApi'
import UserForm from '../components/UserForm'
import { mapAssignedBusinessUnits, mapBusinessUnitAssignmentsToApi, mapEmployeeOptions } from '../data/userAssignmentApiMapper'
import { mapUserFromApi, mapUserToApi } from '../data/userApiMapper'
import { addEmployeeHistoryRow, applyUserStatusToEmployeeRows, closeCurrentEmployee, localDateString } from '../data/userEmployeeHistory'
import { loadUserEmployeeHistory, saveUserEmployeeHistory } from '../data/userEmployeeHistoryStorage'
import { filterUserTypesByBusinessUnit, isUserTypeAvailableForBusinessUnit, loadUserTypeBusinessUnitOptions } from '../data/userTypeBusinessUnitOptions'
import { USER_TABLE, createInitialUserValues, getUserValidityToDate, validateUser } from '../validation/userValidation'

const listPath = '/super-admin/user-creation/user'

async function loadOptionalAssignment(request) {
  try {
    return await request
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

function buildEmployeeHistory(user, options, storedRows) {
  const employeeId = String(user.employeeId ?? '')
  let rows = storedRows.map((row) => ({
    ...row,
    IS_CURRENT: employeeId && String(row.EMPL_ID) === employeeId ? '1' : '0',
  }))
  const assignedOption = options.find((option) => option.value === employeeId)

  if (assignedOption) {
    rows = rows.map((row) => String(row.EMPL_ID) === employeeId ? {
      ...row,
      CODE: assignedOption.code,
      NAME: assignedOption.name,
      DISPLAY_NAME: assignedOption.label,
      BG_ID: assignedOption.bgId,
      BU_ID: assignedOption.buId,
      DEPT_ID: assignedOption.deptId,
      DESIG_ID: assignedOption.desigId,
    } : row)
  }

  if (assignedOption && !rows.some((row) => row.EMPL_ID === employeeId)) {
    rows = [...rows, {
      id: `employee-map-${employeeId}`,
      EMPL_ID: employeeId,
      CODE: assignedOption.code,
      NAME: assignedOption.name,
      DISPLAY_NAME: assignedOption.label,
      BG_ID: assignedOption.bgId,
      BU_ID: assignedOption.buId,
      DEPT_ID: assignedOption.deptId,
      DESIG_ID: assignedOption.desigId,
      ACTIVE_FROM: String(user.fromDate ?? '').slice(0, 10) || localDateString(),
      ACTIVE_TO: Number(user.status ?? 1) === 1 ? '' : localDateString(),
      STATUS: String(user.status ?? 1),
      IS_CURRENT: '1',
    }]
  }
  return rows
}

function UserEdit() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const userNameRef = useRef(null)
  const initialValues = createInitialUserValues()
  const initialHistory = loadUserEmployeeHistory(userId)
  const [values, setValues] = useState(initialValues)
  const [originalValues, setOriginalValues] = useState(initialValues)
  const [activeAssignmentTab, setActiveAssignmentTab] = useState('employee')
  const [employeeRows, setEmployeeRows] = useState(initialHistory)
  const [originalEmployeeRows, setOriginalEmployeeRows] = useState(initialHistory)
  const [businessUnitRows, setBusinessUnitRows] = useState([])
  const [originalBusinessUnitRows, setOriginalBusinessUnitRows] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [userTypesLoading, setUserTypesLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { groupOptions, businessUnitOptions, groupsLoading, unitsLoading } = useBusinessOptions(values.BG_ID, {
    preserveGroupId: originalValues.BG_ID,
    preserveUnitId: originalValues.BU_ID,
  })
  const { roleOptions, rolesLoading, rolesError } = useBusinessUnitRoleOptions(values.BU_ID)

  useEffect(() => {
    let active = true
    Promise.all([
      usersApi.get(userId),
      loadUserTypeBusinessUnitOptions(),
      employeesApi.list(),
      loadOptionalAssignment(userAssignmentsApi.getBusinessUnits(userId)),
      businessUnitsApi.list(),
    ])
      .then(async ([user, userTypes, employees, unitAssignments, units]) => {
        const unit = user.buId ? await businessUnitsApi.get(user.buId) : null
        if (!active) return
        const mapped = mapUserFromApi(user, { businessGroupId: unit?.bgId })
        const options = mapEmployeeOptions(employees, user.employeeId)
        const nextEmployeeRows = buildEmployeeHistory(user, options, loadUserEmployeeHistory(userId))
        const unitNames = new Map(units.map((record) => [String(record.id), record.businessUnit]))
        let nextBusinessUnitRows = mapAssignedBusinessUnits(unitAssignments, unitNames)
        if (user.buId && !nextBusinessUnitRows.some((row) => row.BU_ID === String(user.buId))) {
          nextBusinessUnitRows = [...nextBusinessUnitRows, {
            id: `business-unit-${user.buId}`,
            MAPPING_ID: null,
            BU_ID: String(user.buId),
            NAME: unitNames.get(String(user.buId)) || String(user.buId),
            STATUS: '1',
          }]
        }

        const mappedWithEligibleUserType = isUserTypeAvailableForBusinessUnit(
          userTypes,
          mapped.USER_TYPE_ID,
          mapped.BU_ID,
        ) ? mapped : { ...mapped, USER_TYPE_ID: '' }
        setValues(mappedWithEligibleUserType)
        setOriginalValues(mappedWithEligibleUserType)
        setEmployeeRows(nextEmployeeRows)
        setOriginalEmployeeRows(nextEmployeeRows)
        setBusinessUnitRows(nextBusinessUnitRows)
        setOriginalBusinessUnitRows(nextBusinessUnitRows)
        setEmployeeOptions(options)
        setUserTypeOptions(userTypes)
      })
      .catch((error) => {
        if (active) setMessage(getApiErrorMessage(error, 'Unable to load User.'))
      })
      .finally(() => { if (active) setUserTypesLoading(false) })
    return () => { active = false }
  }, [userId])

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
      ...(name === 'FROM_DATE' ? { TO_DATE: getUserValidityToDate(nextValue) } : {}),
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
          if (existing) return current.map((row) => row.BU_ID === nextValue ? { ...row, STATUS: '1' } : row)
          return [...current, { id: `business-unit-map-${Date.now()}`, MAPPING_ID: null, BU_ID: nextValue, NAME: selectedUnit.label, STATUS: '1' }]
        })
      }
      setEmployeeRows((current) => closeCurrentEmployee(current, nextValue))
    }
    if (name === 'STATUS') setEmployeeRows((current) => applyUserStatusToEmployeeRows(current, nextValue))

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'BG_ID' ? { BU_ID: undefined, ROLE_ID: undefined } : {}),
      ...(name === 'BU_ID' ? { ROLE_ID: undefined } : {}),
      ...((name === 'BG_ID' || name === 'BU_ID') ? { USER_TYPE_ID: undefined } : {}),
      ...(name === 'FROM_DATE' ? { TO_DATE: undefined } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const valuesWithEligibleRole = values.ROLE_ID
      && !roleOptions.some((option) => option.value === values.ROLE_ID)
      ? { ...values, ROLE_ID: '' }
      : values
    const result = validateUser(valuesWithEligibleRole, [], [], { requirePassword: false })
    setValues(result.values)
    setErrors(result.errors)
    if (!result.isValid) return

    setSubmitting(true)
    setMessage('')
    const selectedEmployee = employeeRows.find((row) => row.IS_CURRENT === '1') || null
    try {
      await usersApi.update(userId, mapUserToApi(result.values, selectedEmployee))
      saveUserEmployeeHistory(userId, employeeRows)
      setOriginalEmployeeRows(employeeRows)
      try {
        await userAssignmentsApi.saveBusinessUnits(
          userId,
          mapBusinessUnitAssignmentsToApi(userId, result.values.BG_ID, businessUnitRows),
        )
      } catch (assignmentError) {
        const detail = normalizeApiError(assignmentError, 'Unable to save User Business Unit assignments.').message
        const partialMessage = `The User was updated, but its Business Unit assignments were not fully saved. ${detail}`
        setMessage(getApiErrorMessage(new Error(partialMessage), partialMessage))
        return
      }
      navigate(listPath)
    } catch (error) {
      setMessage(applyApiFormErrors(error, setErrors, 'Unable to update User.', {
        userName: 'USER_NAME', fullName: 'FULL_NAME', bgId: 'BG_ID', buId: 'BU_ID',
        employeeId: 'ASSIGNMENTS', deptId: 'ASSIGNMENTS', desigId: 'ASSIGNMENTS',
        businessGroup: 'BG_ID', businessUnit: 'BU_ID', email: 'EMAIL', mobileNo: 'MOBILE_NO',
        password: 'PASSWORD', fromDate: 'FROM_DATE', toDate: 'TO_DATE', roleId: 'ROLE_ID',
        userTypeId: 'USER_TYPE_ID', androidId: 'ANDROID_ID',
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

  const selectedEmployee = employeeRows.find((row) => row.IS_CURRENT === '1')
  const visibleEmployeeOptions = values.BU_ID
    ? employeeOptions.filter((option) => option.buId === values.BU_ID)
    : []
  const visibleUserTypeOptions = filterUserTypesByBusinessUnit(userTypeOptions, values.BU_ID)

  const stageEmployee = (row) => {
    if (!row || employeeRows.some((employee) => (
      employee.EMPL_ID === row.EMPL_ID && String(employee.STATUS) === '1'
    ))) return
    setEmployeeRows(addEmployeeHistoryRow(originalEmployeeRows, row, values.STATUS))
    setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
  }

  const removeBusinessUnit = (indexToRemove) => {
    const removed = businessUnitRows[indexToRemove]
    const remaining = businessUnitRows.filter((_, index) => index !== indexToRemove)
    setBusinessUnitRows(remaining)
    if (removed?.BU_ID === values.BU_ID) {
      const nextMainUnitId = remaining.find((row) => row.STATUS === '1')?.BU_ID || ''
      setValues((current) => ({ ...current, BU_ID: nextMainUnitId }))
      setEmployeeRows((current) => closeCurrentEmployee(current, nextMainUnitId))
    }
  }

  return (
    <FormPage title={'User Edit'} listTo={listPath} tableName={USER_TABLE} onSubmit={handleSubmit} onReset={handleReset} submitLabel={'Update'} message={rolesError ? getApiErrorMessage(rolesError, 'Unable to load Roles for this Business Unit.') : message} messageTone={'error'} submitting={submitting}>
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
        requirePassword={false}
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
          if (!values.BU_ID) setValues((current) => ({ ...current, BU_ID: row.BU_ID }))
          setErrors((current) => ({ ...current, ASSIGNMENTS: undefined }))
        }}
        onRemoveBusinessUnit={removeBusinessUnit}
      />
    </FormPage>
  )
}

export default UserEdit
