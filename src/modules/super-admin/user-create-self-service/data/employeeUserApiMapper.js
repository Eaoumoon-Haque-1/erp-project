/** @file Maps Employee/User records and Employee User create requests. */
const text = (value) => value == null ? '' : String(value)

export function mapEmployeeUserRow(employee = {}, user = {}, labels = {}) {
  const buId = text(user.buId ?? employee.buId)
  const deptId = text(user.deptId ?? employee.deptId)
  const desigId = text(user.desigId ?? employee.desigId)
  const roleId = text(user.roleId)
  const userTypeId = text(user.userTypeId)
  const hasUser = user.userId !== null && user.userId !== undefined

  return {
    ID: text(employee.id ?? user.employeeId),
    EMPLOYEE_ID: employee.employeeCode ?? user.employeeCode ?? text(employee.id ?? user.employeeId),
    EMPLOYEE_NAME: user.employeeName ?? employee.employeeName ?? '',
    BG_ID: text(user.bgId ?? employee.bgId),
    BU_ID: buId,
    DEPT_ID: deptId,
    DESIG_ID: desigId,
    BUSINESS_UNIT_NAME: labels.businessUnits?.get(buId) || buId,
    DEPARTMENT_NAME: labels.departments?.get(deptId) || deptId,
    DESIGNATION_NAME: labels.designations?.get(desigId) || desigId,
    USER_ID: text(user.userId),
    USER_NAME: user.userName ?? '',
    USER_ROLE: roleId,
    USER_ROLE_NAME: labels.roles?.get(roleId) || roleId,
    USER_TYPE: userTypeId,
    USER_TYPE_NAME: labels.userTypes?.get(userTypeId) || userTypeId,
    IS_ACTIVE: text(hasUser ? user.status ?? 1 : 1),
    HAS_USER: hasUser ? '1' : '0',
    EMPLOYEE_RECORD: employee,
  }
}

export function mapEmployeeUserCreateToApi(values) {
  return {
    userName: values.USER_NAME,
    password: values.PASSWORD,
    confirmPassword: values.CONFIRM_PASSWORD,
    fromDate: values.VALID_FROM_DATE || null,
    toDate: values.VALID_TO_DATE || null,
    roleId: Number(values.USER_ROLE),
    userTypeId: Number(values.USER_TYPE),
    isAndroidFixed: Number(values.IS_ANDROID_ID_FIXED),
    androidId: values.ANDROID_ID || null,
    status: Number(values.IS_ACTIVE),
  }
}
