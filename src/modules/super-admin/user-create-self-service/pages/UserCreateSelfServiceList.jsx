/**
 * @file User self-service setup list backed by User CRUD APIs.
 * Pending employee rows remain temporary because the newly documented Employee
 * integration is deferred; created user accounts use the `/users` API.
 */
import { useEffect, useState } from 'react'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { usersApi } from '../../user/api/userApi'
import { getApiErrorMessage } from '../../../../api/errors'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import UserCreateSelfServiceModal from '../components/UserCreateSelfServiceModal'

const pendingEmployeeRows = [
  { ID: 'pending-1', EMPLOYEE_ID: 'EMP-0101', EMPLOYEE_NAME: 'Samira Rahman', BUSINESS_UNIT_NAME: 'Head Office', BU_ID: '1', DEPARTMENT_NAME: 'Human Resources', DESIGNATION_NAME: 'HR Executive', SUGGESTED_USERNAME: 'srahman', HAS_USER: '0', IS_ACTIVE: '1' },
  { ID: 'pending-2', EMPLOYEE_ID: 'EMP-0103', EMPLOYEE_NAME: 'Md. Eaoumoon Haque', BUSINESS_UNIT_NAME: 'Factory Unit', BU_ID: '2', DEPARTMENT_NAME: 'Software & IT', DESIGNATION_NAME: 'Software Engineer', SUGGESTED_USERNAME: 'ehaque', HAS_USER: '0', IS_ACTIVE: '1' },
]

const columns = [
  { key: 'BUSINESS_UNIT_NAME', label: 'Business Unit' }, { key: 'EMPLOYEE_ID', label: 'Employee ID' }, { key: 'EMPLOYEE_NAME', label: 'Employee Name' },
  { key: 'DEPARTMENT_NAME', label: 'Department' }, { key: 'DESIGNATION_NAME', label: 'Designation' },
  { key: 'HAS_USER', label: 'User Status', render: (value, row) => <span className={`inline-flex rounded-[5px] px-[5px] py-[3px] text-xs font-bold leading-none text-white ${value === '1' ? (row.IS_ACTIVE === '1' ? 'bg-action-success' : 'bg-action-danger') : 'bg-amber-500'}`}>{value === '1' ? (row.IS_ACTIVE === '1' ? 'Active' : 'Inactive') : 'Pending'}</span> },
]
const filters = [
  { key: 'EMPLOYEE_NAME', label: 'Employee Name', placeholder: '--Search by Employee--', matches: (row, value) => row.EMPLOYEE_NAME.toLowerCase().includes(value.toLowerCase()) },
  { key: 'HAS_USER', label: 'User Status', placeholder: '--Search by User Status--', options: [{ label: 'User Created', value: '1' }, { label: 'Pending', value: '0' }] },
]

function ProfileAction({ onClick }) {
  return <button type={'button'} className={'inline-flex h-6 w-[34px] items-center justify-center rounded bg-amber-500 text-white'} aria-label={'Create user profile'} title={'Create user profile'} onClick={onClick}><svg viewBox={'0 0 24 24'} className={'size-4'} fill={'none'} stroke={'currentColor'} strokeWidth={'2'}><path d={'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'} /><circle cx={'12'} cy={'7'} r={'4'} /><path d={'M19 8v6M16 11h6'} /></svg></button>
}

function asIsoDateTime(value) { return value ? new Date(`${value}T00:00:00`).toISOString() : null }
function dateOnly(value) { return value ? String(value).slice(0, 10) : '' }

function UserCreateSelfServiceList() {
  const [rows, setRows] = useState(pendingEmployeeRows)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [roleOptions, setRoleOptions] = useState([])
  const [userTypeOptions, setUserTypeOptions] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [users, roles, userTypes, units] = await Promise.all([usersApi.list(), rolesApi.list(), userTypesApi.list(), businessUnitsApi.list()])
      const unitMap = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
      const unitGroupMap = new Map(units.map((unit) => [String(unit.id), String(unit.bgId ?? '')]))
      const roleMap = new Map(roles.map((role) => [String(role.id), role.roleName]))
      const typeMap = new Map(userTypes.map((type) => [String(type.id), type.typeName]))
      const apiRows = users.map((user) => ({
        ID: String(user.id), EMPLOYEE_ID: '-', EMPLOYEE_NAME: user.fullName || user.userName, BUSINESS_UNIT_NAME: unitMap.get(String(user.buId)) || String(user.buId || '-'), BG_ID: String(user.bgId ?? unitGroupMap.get(String(user.buId)) ?? ''), BU_ID: String(user.buId || ''),
        DEPARTMENT_NAME: '-', DESIGNATION_NAME: '-', USER_NAME: user.userName, USER_ROLE: String(user.roleId || ''), USER_TYPE: String(user.userTypeId || ''), ROLE_NAME: roleMap.get(String(user.roleId)) || '', USER_TYPE_NAME: typeMap.get(String(user.userTypeId)) || '',
        VALID_FROM_DATE: dateOnly(user.fromDate), VALID_TO_DATE: dateOnly(user.toDate), IS_ANDROID_ID_FIXED: String(user.isAndroidFixed ?? 0), HAS_USER: '1', IS_ACTIVE: String(user.status ?? 1), API_RECORD: user,
      }))
      setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
      setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.typeName })))
      setRows([...pendingEmployeeRows.map((row) => ({ ...row, BG_ID: unitGroupMap.get(row.BU_ID) || '' })), ...apiRows])
      setMessage('')
    } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to load user setup records.')) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    Promise.all([usersApi.list(), rolesApi.list(), userTypesApi.list(), businessUnitsApi.list()])
      .then(([users, roles, userTypes, units]) => {
        if (!active) return
        const unitMap = new Map(units.map((unit) => [String(unit.id), unit.businessUnit]))
        const unitGroupMap = new Map(units.map((unit) => [String(unit.id), String(unit.bgId ?? '')]))
        const roleMap = new Map(roles.map((role) => [String(role.id), role.roleName]))
        const typeMap = new Map(userTypes.map((type) => [String(type.id), type.typeName]))
        const apiRows = users.map((user) => ({
          ID: String(user.id), EMPLOYEE_ID: '-', EMPLOYEE_NAME: user.fullName || user.userName, BUSINESS_UNIT_NAME: unitMap.get(String(user.buId)) || String(user.buId || '-'), BG_ID: String(user.bgId ?? unitGroupMap.get(String(user.buId)) ?? ''), BU_ID: String(user.buId || ''),
          DEPARTMENT_NAME: '-', DESIGNATION_NAME: '-', USER_NAME: user.userName, USER_ROLE: String(user.roleId || ''), USER_TYPE: String(user.userTypeId || ''), ROLE_NAME: roleMap.get(String(user.roleId)) || '', USER_TYPE_NAME: typeMap.get(String(user.userTypeId)) || '',
          VALID_FROM_DATE: dateOnly(user.fromDate), VALID_TO_DATE: dateOnly(user.toDate), IS_ANDROID_ID_FIXED: String(user.isAndroidFixed ?? 0), HAS_USER: '1', IS_ACTIVE: String(user.status ?? 1), API_RECORD: user,
        }))
        setRoleOptions(roles.map((role) => ({ value: String(role.id), label: role.roleName })))
        setUserTypeOptions(userTypes.map((type) => ({ value: String(type.id), label: type.typeName })))
        setRows([...pendingEmployeeRows.map((row) => ({ ...row, BG_ID: unitGroupMap.get(row.BU_ID) || '' })), ...apiRows])
        setMessage('')
      })
      .catch((error) => { if (active) setMessage(getApiErrorMessage(error, 'Unable to load user setup records.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const save = async (values) => {
    const payload = {
      bgId: Number(selectedEmployee.BG_ID),
      buId: Number(selectedEmployee.BU_ID),
      deptId: selectedEmployee.API_RECORD?.deptId ?? null,
      desigId: selectedEmployee.API_RECORD?.desigId ?? null,
      userName: values.USER_NAME,
      fullName: selectedEmployee.EMPLOYEE_NAME,
      email: selectedEmployee.API_RECORD?.email ?? null,
      mobileNo: selectedEmployee.API_RECORD?.mobileNo ?? null,
      fromDate: asIsoDateTime(values.VALID_FROM_DATE),
      toDate: asIsoDateTime(values.VALID_TO_DATE),
      roleId: Number(values.USER_ROLE),
      userTypeId: Number(values.USER_TYPE),
      isAndroidFixed: Number(values.IS_ANDROID_ID_FIXED),
      androidId: selectedEmployee.API_RECORD?.androidId ?? null,
      status: Number(values.IS_ACTIVE),
    }
    // Never echo a stored password/hash back to the API. A password is sent
    // only when the operator explicitly entered a new one in the modal.
    if (values.PASSWORD) payload.password = values.PASSWORD
    try {
      if (selectedEmployee.HAS_USER === '1') await usersApi.update(selectedEmployee.ID, payload)
      else await usersApi.create(payload)
      setSelectedEmployee(null); await load()
    } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to save the user account.')) }
  }

  const remove = async (row) => { try { await usersApi.remove(row.ID); await load() } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to remove user.')) } }
  const toggle = async (row) => { try { await usersApi.update(row.ID, { ...row.API_RECORD, status: row.IS_ACTIVE === '1' ? 0 : 1 }); await load() } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to change user status.')) } }

  return <><ListPage title={'User Create Self Service List'} filters={filters} columns={columns} rows={rows} loading={loading} message={message} renderActions={(row) => row.HAS_USER === '1' ? <ListRowActions row={row} onView={setSelectedEmployee} onEdit={setSelectedEmployee} onDelete={remove} onStatusChange={toggle} /> : <ProfileAction onClick={() => setSelectedEmployee(row)} />} />{selectedEmployee && <UserCreateSelfServiceModal key={selectedEmployee.ID} open employee={selectedEmployee} roleOptions={roleOptions} userTypeOptions={userTypeOptions} onClose={() => setSelectedEmployee(null)} onSave={save} />}</>
}

export default UserCreateSelfServiceList
