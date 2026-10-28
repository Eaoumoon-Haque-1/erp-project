/** @file Read-only User details with related API names. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../business-unit/api/businessUnitApi'
import { departmentsApi } from '../../../hris/department/api/departmentApi'
import { designationsApi } from '../../../hris/designation/api/designationApi'
import { employeesApi } from '../../../hris/employee-information/api/employeeApi'
import { rolesApi } from '../../role/api/roleApi'
import { userTypesApi } from '../../user-type/api/userTypeApi'
import { usersApi } from '../api/userApi'

const viewConfig = {
  title: 'User View',
  param: 'userId',
  listTo: '/super-admin/user-creation/user',
  editTo: (id) => `/super-admin/user-creation/user/${id}/edit`,
  loader: async (id) => {
    const [user, units, roles, userTypes, groups, departments, designations, employees] = await Promise.all([
      usersApi.get(id),
      businessUnitsApi.list(),
      rolesApi.list(),
      userTypesApi.list(),
      businessGroupsApi.list(),
      departmentsApi.list(),
      designationsApi.list(),
      employeesApi.list(),
    ])
    const unit = units.find((record) => String(record.id) === String(user.buId))
    const employee = employees.find((record) => String(record.id) === String(user.employeeId))
    return {
      ...user,
      businessUnitName: unit?.businessUnit,
      groupName: groups.find((record) => String(record.id) === String(user.bgId ?? unit?.bgId))?.groupName,
      roleName: roles.find((record) => String(record.id) === String(user.roleId))?.roleName,
      userTypeName: userTypes.find((record) => String(record.id) === String(user.userTypeId))?.typeName,
      employeeDisplay: employee
        ? `${employee.employeeName} (${user.employeeId})`
        : '',
      departmentName: departments.find((record) => String(record.id) === String(user.deptId))?.departmentName,
      designationName: designations.find((record) => String(record.id) === String(user.desigId))?.designationName,
    }
  },
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Business Unit', key: 'businessUnitName' },
    { label: 'Full Name', key: 'fullName' },
    { label: 'User Name', key: 'userName' },
    { label: 'Email', key: 'email' },
    { label: 'Mobile No', key: 'mobileNo' },
    { label: 'User Type', key: 'userTypeName' },
    { label: 'Role', key: 'roleName' },
    { label: 'Employee', key: 'employeeDisplay' },
    { label: 'Department', key: 'departmentName' },
    { label: 'Designation', key: 'designationName' },
    { label: 'Validate From Date', value: (record) => record.fromDate ? String(record.fromDate).slice(0, 10) : '' },
    { label: 'Validate To Date', value: (record) => record.toDate ? String(record.toDate).slice(0, 10) : '' },
    { label: 'Android ID Fixed', key: 'isAndroidFixed', type: 'boolean' },
    { label: 'Android ID', key: 'androidId' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function UserView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default UserView
