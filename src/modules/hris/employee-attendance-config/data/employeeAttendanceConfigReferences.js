/** @file Loads real reference data for Employee Attendance Config. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationsApi } from '../../designation/api/designationApi'
import { employeesApi } from '../../employee-information/api/employeeApi'
import { employmentTypesApi } from '../../employment-type/api/employmentTypeApi'
import { gpsInformationsApi } from '../../gps-information/api/gpsInformationApi'
import { shiftsApi } from '../../shift/api/shiftApi'
import { wifiInformationsApi } from '../../wifi-information/api/wifiInformationApi'

const text = (value) => value == null ? '' : String(value)
const active = (record) => text(record.status ?? 1) === '1'

export async function loadEmployeeAttendanceConfigReferences() {
  const [businessUnits, employees, employmentTypes, departments, designations, shifts, wifi, gps] =
    await Promise.all([
      businessUnitsApi.list(), employeesApi.list(), employmentTypesApi.list(),
      departmentsApi.list(), designationsApi.list(), shiftsApi.list(),
      wifiInformationsApi.list(), gpsInformationsApi.list(),
    ])

  const employmentTypeNames = new Map(employmentTypes.map((item) => [
    text(item.id), item.typeName || item.employmentType || text(item.id),
  ]))
  const departmentNames = new Map(departments.map((item) => [
    text(item.id), item.departmentName || text(item.id),
  ]))
  const designationNames = new Map(designations.map((item) => [
    text(item.id), item.designationName || text(item.id),
  ]))

  const employeeOptions = employees.map((employee) => {
    const empTypeId = text(employee.empTypeId ?? employee.employmentTypeId)
    const deptId = text(employee.deptId)
    const desigId = text(employee.desigId ?? employee.designationId)
    return {
      id: text(employee.id),
      buId: text(employee.buId),
      code: employee.employeeCode || '',
      name: employee.employeeName || '',
      empTypeId,
      deptId,
      desigId,
      type: employmentTypeNames.get(empTypeId) || empTypeId,
      department: departmentNames.get(deptId) || deptId,
      designation: designationNames.get(desigId) || desigId,
      status: text(employee.status ?? 1),
    }
  })

  return {
    businessUnits: businessUnits.filter(active).map((unit) => ({
      ID: text(unit.id), BUSINESS_UNIT: unit.businessUnit || text(unit.id),
    })),
    businessUnitNames: new Map(businessUnits.map((unit) => [text(unit.id), unit.businessUnit || text(unit.id)])),
    employees: employeeOptions,
    employeeNames: new Map(employeeOptions.map((employee) => [employee.id, employee.name])),
    employeeById: new Map(employeeOptions.map((employee) => [employee.id, employee])),
    shiftOptions: shifts.filter(active).map((shift) => ({
      value: text(shift.id), label: shift.shiftTitle || text(shift.id), buId: text(shift.buId),
    })),
    wifiOptions: wifi.filter(active).map((item) => ({
      ID: text(item.id), BU_ID: text(item.buId), WIFI_NAME: item.wifiName || text(item.id),
      MAC_ADDRESS: item.macAddress || '', STATUS: 'Active',
    })),
    gpsOptions: gps.filter(active).map((item) => ({
      ID: text(item.id), BU_ID: text(item.buId), LOCATION_NAME: item.locationName || text(item.id),
      LATITUDE: text(item.latitude), LONGITUDE: text(item.longitude), STATUS: 'Active',
    })),
  }
}
