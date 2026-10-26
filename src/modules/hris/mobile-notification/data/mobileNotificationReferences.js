/** @file Loads and derives Mobile Notification target and type options. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { employeesApi } from '../../employee-information/api/employeeApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../../hr-lookup-value/api/hrLookupValueApi'

const normalized = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const isNotificationType = (record) => [record.typeName, record.code]
  .map(normalized)
  .some((name) => name === 'notificationtype' || name.includes('mobilenotification'))

export async function loadMobileNotificationReferences() {
  const [businessUnits, departments, employees, lookupTypes] = await Promise.all([
    businessUnitsApi.list(), departmentsApi.list(), employeesApi.list(),
    hrLookupTypesApi.list(),
  ])
  const notificationLookupTypes = lookupTypes.filter(isNotificationType)
  const notificationTypes = await hrLookupValuesApi.getByTypesForBusinessGroups(
    notificationLookupTypes,
    businessUnits.map((unit) => unit.bgId),
    { activeOnly: true },
  )
  return {
    businessUnits, departments, employees, notificationTypes,
    businessUnitNames: new Map(businessUnits.map((item) => [String(item.id), item.businessUnit])),
    departmentNames: new Map(departments.map((item) => [String(item.id), item.departmentName])),
    employeeNames: new Map(employees.map((item) => [String(item.id), item.employeeName])),
    notificationTypeNames: new Map(notificationTypes.map((item) => [String(item.id), item.value])),
  }
}

export function getMobileNotificationOptions(references, selectedBusinessUnits = [], selectedDepartments = []) {
  if (!references) return { businessUnits: [], departments: [], employees: [], notificationTypes: [] }
  const unitIds = new Set(selectedBusinessUnits.map(String))
  const departmentIds = new Set(selectedDepartments.map(String))
  const selectedGroupIds = new Set(references.businessUnits
    .filter((item) => unitIds.has(String(item.id))).map((item) => String(item.bgId)))

  return {
    businessUnits: references.businessUnits.filter((item) => String(item.status ?? 1) === '1')
      .map((item) => ({ value: String(item.id), label: item.businessUnit })),
    departments: references.departments
      .filter((item) => selectedGroupIds.has(String(item.bgId)))
      .filter((item) => String(item.status ?? 1) === '1')
      .map((item) => ({ value: String(item.id), label: item.departmentName })),
    employees: references.employees
      .filter((item) => unitIds.has(String(item.buId)) && departmentIds.has(String(item.deptId)))
      .filter((item) => String(item.status ?? 1) === '1')
      .map((item) => ({ value: String(item.id), label: item.employeeName })),
    notificationTypes: references.notificationTypes
      .filter((item) => selectedGroupIds.has(String(item.bgId)))
      .filter((item) => String(item.status ?? 1) === '1')
      .map((item) => ({ value: String(item.id), label: item.value })),
  }
}
