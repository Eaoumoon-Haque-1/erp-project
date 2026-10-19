/** @file API-backed User Create Self Service list and create workflow. */
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { designationsApi } from '../../../hris/designation/api/designationApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { employeeUsersApi } from '../api/employeeUserApi'
import UserCreateSelfServiceModal from '../components/UserCreateSelfServiceModal'
import { mapEmployeeUserCreateToApi, mapEmployeeUserRow } from '../data/employeeUserApiMapper'

const columns = [
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' },
  { key: 'EMPLOYEE_ID', label: 'Employee ID' },
  { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'DEPARTMENT_NAME', label: 'Department' },
  { key: 'DESIGNATION_NAME', label: 'Designation' },
  { key: 'HAS_USER', label: 'User Status', render: (value, row) => (
    <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white ${value === '1' ? (row.IS_ACTIVE === '1' ? 'bg-action-success' : 'bg-action-danger') : 'bg-amber-500'}`}>
      {value === '1' ? (row.IS_ACTIVE === '1' ? 'Active' : 'Inactive') : 'Pending'}
    </span>
  ) },
]

function ProfileAction({ onClick }) {
  return (
    <button type={'button'} className={'inline-flex h-6 w-[34px] items-center justify-center rounded bg-amber-500 text-white'}
      aria-label={'Create user profile'} title={'Create user profile'} onClick={onClick}>
      <svg viewBox={'0 0 24 24'} className={'size-4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'}>
        <path d={'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'} />
        <circle cx={'12'} cy={'7'} r={'4'} /><path d={'M19 8v6M16 11h6'} />
      </svg>
    </button>
  )
}

async function loadEmployeeUser(employee) {
  try {
    return await employeeUsersApi.get(employee.id)
  } catch (error) {
    if (error?.response?.status === 404) return null
    throw error
  }
}

function UserCreateSelfServiceList() {
  const [rows, setRows] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [labels, setLabels] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      employeesApi.list(), businessUnitsApi.list(), departmentsApi.list(), designationsApi.list(),
      rolesApi.list(), userTypesApi.list(),
    ]).then(async ([employees, units, departments, designations, roles, userTypes]) => {
      const loadedLabels = {
        businessUnits: new Map(units.map((item) => [String(item.id), item.businessUnit])),
        departments: new Map(departments.map((item) => [String(item.id), item.departmentName])),
        designations: new Map(designations.map((item) => [String(item.id), item.designationName])),
        roles: new Map(roles.map((item) => [String(item.id), item.roleName])),
        userTypes: new Map(userTypes.map((item) => [String(item.id), item.typeName])),
      }
      const users = await Promise.all(employees.map(loadEmployeeUser))
      if (!active) return
      setLabels(loadedLabels)
      setRows(employees.map((employee, index) => mapEmployeeUserRow(employee, users[index] || {}, loadedLabels)))
      setRoleOptions(roles.filter((item) => String(item.status ?? 1) === '1')
        .map((item) => ({ value: String(item.id), label: item.roleName })))
      setUserTypeOptions(userTypes.filter((item) => String(item.status ?? 1) === '1')
        .map((item) => ({ value: String(item.id), label: item.typeName })))
    }).catch((error) => getApiErrorMessage(error, 'Unable to load Employee Users.'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filters = useMemo(() => [
    { key: 'EMPLOYEE_NAME', label: 'Employee Name', placeholder: '--Search by Employee--',
      matches: (row, value) => row.EMPLOYEE_NAME.toLowerCase().includes(value.toLowerCase()) },
    { key: 'HAS_USER', label: 'User Status', placeholder: '--Search by User Status--', options: [
      { label: 'User Created', value: '1' }, { label: 'Pending', value: '0' },
    ] },
  ], [])

  const save = async (values) => {
    const created = await employeeUsersApi.create(selectedEmployee.ID, mapEmployeeUserCreateToApi(values))
    setRows((current) => current.map((row) => row.ID === selectedEmployee.ID
      ? mapEmployeeUserRow(row.EMPLOYEE_RECORD, created, labels) : row))
    setSelectedEmployee(null)
  }

  return (
    <>
      <ListPage title={'User Create Self Service List'} filters={filters} columns={columns}
        rows={rows} rowKey={'ID'} loading={loading} renderActions={(row) => row.HAS_USER === '1'
          ? <ListRowActions row={row} entityName={'Employee User'} onView={() => setSelectedEmployee(row)} />
          : <ProfileAction onClick={() => setSelectedEmployee(row)} />} />
      {selectedEmployee && (
        <UserCreateSelfServiceModal key={selectedEmployee.ID} open employee={selectedEmployee}
          roleOptions={roleOptions} userTypeOptions={userTypeOptions}
          readOnly={selectedEmployee.HAS_USER === '1'}
          onClose={() => setSelectedEmployee(null)} onSave={save} />
      )}
    </>
  )
}

export default UserCreateSelfServiceList
