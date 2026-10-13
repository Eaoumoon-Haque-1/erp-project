/**
 * @file Static User Create Self Service prototype.
 * This feature intentionally performs no API requests until its backend
 * contract and Employee source are confirmed.
 */
import { useState } from 'react'
import ListPage from '../../../../components/shared/ListPage'
import ListRowActions from '../../../../components/shared/ListRowActions'
import {
  mockRoleOptions,
  mockUserTypeOptions,
} from '../../../hris/user-creation-from-employee/validation/userCreationFromEmployeeValidation'
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

function UserCreateSelfServiceList() {
  const [rows, setRows] = useState(pendingEmployeeRows)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const save = (values) => {
    setRows((current) => current.map((row) => row.ID === selectedEmployee.ID
      ? {
          ...row,
          USER_NAME: values.USER_NAME,
          USER_ROLE: values.USER_ROLE,
          USER_TYPE: values.USER_TYPE,
          VALID_FROM_DATE: values.VALID_FROM_DATE,
          VALID_TO_DATE: values.VALID_TO_DATE,
          IS_ANDROID_ID_FIXED: values.IS_ANDROID_ID_FIXED,
          IS_ACTIVE: values.IS_ACTIVE,
          HAS_USER: '1',
        }
      : row))
    setSelectedEmployee(null)
  }

  const remove = (row) => {
    setRows((current) => current.map((item) => item.ID === row.ID
      ? {
          ...item,
          USER_NAME: '',
          USER_ROLE: '',
          USER_TYPE: '',
          VALID_FROM_DATE: '',
          VALID_TO_DATE: '',
          IS_ANDROID_ID_FIXED: '0',
          IS_ACTIVE: '1',
          HAS_USER: '0',
        }
      : item))
    return true
  }

  const toggle = (row) => {
    setRows((current) => current.map((item) => item.ID === row.ID
      ? { ...item, IS_ACTIVE: item.IS_ACTIVE === '1' ? '0' : '1' }
      : item))
    return true
  }

  return <><ListPage title={'User Create Self Service List'} filters={filters} columns={columns} rows={rows} loading={false} renderActions={(row) => row.HAS_USER === '1' ? <ListRowActions row={row} onView={setSelectedEmployee} onEdit={setSelectedEmployee} onDelete={remove} onStatusChange={toggle} /> : <ProfileAction onClick={() => setSelectedEmployee(row)} />} />{selectedEmployee && <UserCreateSelfServiceModal key={selectedEmployee.ID} open employee={selectedEmployee} roleOptions={mockRoleOptions} userTypeOptions={mockUserTypeOptions} onClose={() => setSelectedEmployee(null)} onSave={save} />}</>
}

export default UserCreateSelfServiceList
