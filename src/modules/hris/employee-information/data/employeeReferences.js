/** @file Loads API-backed dropdown references without changing the Employee form layout. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { degreesApi } from '../../degree-education-mapping/api/degreeApi'
import { designationsApi } from '../../designation/api/designationApi'
import { employmentStatusesApi } from '../../employment-status/api/employmentStatusApi'
import { employmentTypesApi } from '../../employment-type/api/employmentTypeApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../../hr-lookup-value/api/hrLookupValueApi'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { shiftsApi } from '../../shift/api/shiftApi'
import { employeesApi } from '../api/employeeApi'

const normalized = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const active = (item) => String(item.status ?? 1) === '1'
const option = (value, label, extra = {}) => ({ value: String(value), label: label || String(value), ...extra })

const lookupAliases = {
  genderOptions: ['gender'],
  religionOptions: ['religion'],
  nationalityOptions: ['nationality', 'nationalities'],
  bloodGroupOptions: ['bloodgroup'],
  disabilityTypeOptions: ['disabilitytype'],
  countryOptions: ['country', 'countries'],
}

function lookupOptions(types, values, aliases) {
  const typeIds = new Set(types
    .filter((type) => aliases.includes(normalized(type.code)) || aliases.includes(normalized(type.typeName)))
    .map((type) => String(type.id)))
  return values
    .filter((value) => typeIds.has(String(value.typeId)) && active(value))
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((value) => option(value.id, value.value, { bgId: String(value.bgId ?? '') }))
}

export async function loadEmployeeReferences() {
  const [
    businessUnits, departments, designations, employmentTypes, employmentStatuses,
    shifts, employees, levels, degrees, lookupTypes, lookupValues,
  ] = await Promise.all([
    businessUnitsApi.list(), departmentsApi.list(), designationsApi.list(), employmentTypesApi.list(),
    employmentStatusesApi.list(), shiftsApi.list(), employeesApi.list(), levelOfEducationsApi.list(),
    degreesApi.list(), hrLookupTypesApi.list(), hrLookupValuesApi.list(),
  ])

  const references = {
    businessUnits,
    departments,
    designations,
    employmentTypes,
    employmentStatuses,
    shifts,
    employees,
    levels,
    degrees,
    lookupTypes,
    lookupValues,
  }

  const options = {
    businessUnitOptions: businessUnits.filter(active).map((item) => option(item.id, item.businessUnit, { bgId: String(item.bgId ?? '') })),
    departmentOptions: departments.filter(active).map((item) => option(item.id, item.departmentName, { bgId: String(item.bgId ?? '') })),
    designationOptions: designations.filter(active).map((item) => option(item.id, item.designationName, { bgId: String(item.bgId ?? '') })),
    employmentTypeOptions: employmentTypes.filter(active).map((item) => option(item.id, item.typeName)),
    employmentStatusOptions: employmentStatuses.filter(active).map((item) => option(item.id, item.statusName)),
    shiftOptions: shifts.filter(active).map((item) => option(item.id, item.shiftTitle, { businessUnitId: String(item.buId ?? '') })),
    reportingOfficerOptions: employees.filter(active).map((item) => ({
      value: String(item.id), employeeId: item.employeeCode ?? '', name: item.employeeName ?? '',
      department: departments.find((department) => String(department.id) === String(item.deptId))?.departmentName ?? '',
      designation: designations.find((designation) => String(designation.id) === String(item.desigId))?.designationName ?? '',
      bgId: String(item.bgId ?? ''),
    })),
    educationLevelOptions: levels.filter(active).map((item) => option(item.id, item.levelOfEdu)),
    degreeTitleOptions: degrees.filter(active).map((item) => option(item.id, item.degreeName, { levelOfEducationId: String(item.levelOfEduId ?? '') })),
  }

  Object.entries(lookupAliases).forEach(([key, aliases]) => {
    options[key] = lookupOptions(lookupTypes, lookupValues, aliases)
  })

  return { references, options }
}

export function createEmployeeReferenceNames(references = {}) {
  const toMap = (records = [], labelKey) => new Map(records.map((item) => [String(item.id), item[labelKey] ?? '']))
  return {
    businessUnits: toMap(references.businessUnits, 'businessUnit'),
    departments: toMap(references.departments, 'departmentName'),
    designations: toMap(references.designations, 'designationName'),
    employmentTypes: toMap(references.employmentTypes, 'typeName'),
    employmentStatuses: toMap(references.employmentStatuses, 'statusName'),
    shifts: toMap(references.shifts, 'shiftTitle'),
    levels: toMap(references.levels, 'levelOfEdu'),
    employees: toMap(references.employees, 'employeeName'),
    lookupValues: toMap(references.lookupValues, 'value'),
  }
}
