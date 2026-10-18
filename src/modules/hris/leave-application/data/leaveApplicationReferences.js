/** @file Loads real reference records used by Leave Application pages. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationsApi } from '../../designation/api/designationApi'
import { employeesApi } from '../../employee-information/api/employeeApi'
import { employmentTypesApi } from '../../employment-type/api/employmentTypeApi'
import { leaveTypesApi } from '../../leave-type/api/leaveTypeApi'

export async function loadLeaveApplicationReferences() {
  const [employees, businessUnits, departments, designations, employmentTypes, leaveTypes] = await Promise.all([
    employeesApi.list(),
    businessUnitsApi.list(),
    departmentsApi.list(),
    designationsApi.list(),
    employmentTypesApi.list(),
    leaveTypesApi.list(),
  ])

  return {
    employees,
    employeeById: new Map(employees.map((record) => [String(record.id), record])),
    employeeOptions: employees
      .filter((record) => String(record.status ?? 1) === '1')
      .map((record) => ({
        value: String(record.id),
        label: record.employeeCode
          ? `${record.employeeName} (${record.employeeCode})`
          : record.employeeName,
      })),
    businessUnitNames: new Map(businessUnits.map((record) => [String(record.id), record.businessUnit])),
    departmentNames: new Map(departments.map((record) => [String(record.id), record.departmentName])),
    designationNames: new Map(designations.map((record) => [String(record.id), record.designationName])),
    employmentTypeNames: new Map(employmentTypes.map((record) => [String(record.id), record.typeName])),
    leaveCategoryNames: new Map(leaveTypes.map((record) => [String(record.id), record.typeName])),
  }
}

export function mapLeaveBalanceOptions(records = []) {
  return records.map((record) => ({
    value: String(record.leaveCategoryId),
    label: record.leaveCategoryName,
    balance: record.remainingLeaveDays == null ? '' : String(record.remainingLeaveDays),
  }))
}
