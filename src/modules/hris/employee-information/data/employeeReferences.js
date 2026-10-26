/** @file Loads API-backed dropdown references without changing the Employee form layout. */
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { degreesApi } from '../../degree-education-mapping/api/degreeApi'
import { designationDepartmentMappingsApi } from '../../designation-department-mapping/api/designationDepartmentMappingApi'
import { designationsApi } from '../../designation/api/designationApi'
import { employmentStatusesApi } from '../../employment-status/api/employmentStatusApi'
import { employmentTypesApi } from '../../employment-type/api/employmentTypeApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../../hr-lookup-value/api/hrLookupValueApi'
import { levelOfEducationsApi } from '../../level-of-education/api/levelOfEducationApi'
import { shiftsApi } from '../../shift/api/shiftApi'
import { employeesApi } from '../api/employeeApi'
import {
  bloodGroupOptions as fixedBloodGroupOptions,
  genderOptions as fixedGenderOptions,
  religionOptions as fixedReligionOptions,
  toSelectOptions,
} from './employeeOptions'

const normalized = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const active = (item) => String(item.status ?? 1) === '1'
const option = (value, label, extra = {}) => ({ value: String(value), label: label || String(value), ...extra })

const lookupAliases = {
  nationalityOptions: ['nationality', 'nationalities'],
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

function mappedBusinessUnitOptions(
  masters,
  mappings,
  mappingIdKey,
  labelKey,
  dependency = null,
) {
  const masterById = new Map(
    masters.filter(active).map((master) => [String(master.id), master]),
  )
  const uniqueOptions = new Map()

  mappings.filter(active).forEach((mapping) => {
    const master = masterById.get(String(mapping[mappingIdKey]))
    if (!master || mapping.buId == null) return

    const businessUnitId = String(mapping.buId)
    const value = String(master.id)
    const dependencyValue = dependency
      ? String(mapping[dependency.mappingKey] ?? '')
      : ''
    uniqueOptions.set(`${businessUnitId}:${dependencyValue}:${value}`, option(
      value,
      master[labelKey],
      {
        bgId: String(mapping.bgId ?? master.bgId ?? ''),
        businessUnitId,
        ...(dependency ? { [dependency.optionKey]: dependencyValue } : {}),
      },
    ))
  })

  return [...uniqueOptions.values()]
}

export async function loadEmployeeReferences() {
  const [
    businessUnits, departments, designations, departmentDesignationMappings,
    employmentTypes, employmentStatuses, shifts, employees, levels, degrees, lookupTypes,
  ] = await Promise.all([
    businessUnitsApi.list(), departmentsApi.list(), designationsApi.list(),
    designationDepartmentMappingsApi.list(), employmentTypesApi.list(),
    employmentStatusesApi.list(), shiftsApi.list(), employeesApi.list(),
    levelOfEducationsApi.list(), degreesApi.list(), hrLookupTypesApi.list(),
  ])

  const relevantLookupTypes = lookupTypes.filter((type) => (
    Object.values(lookupAliases).some((aliases) => (
      aliases.includes(normalized(type.code)) || aliases.includes(normalized(type.typeName))
    ))
  ))
  const businessGroupIds = [...new Set(businessUnits.map((unit) => String(unit.bgId ?? '')).filter(Boolean))]
  const lookupRequests = relevantLookupTypes.flatMap((type) => {
    const typeCode = String(type.code ?? '').trim()
    if (!typeCode) return []
    return businessGroupIds.map((businessGroupId) => ({ type, typeCode, businessGroupId }))
  })
  const lookupValueBatches = await Promise.all(lookupRequests.map(
    ({ typeCode, businessGroupId }) => (
      hrLookupValuesApi.getByTypeCode(typeCode, { businessGroupId, activeOnly: true })
    ),
  ))
  const lookupValues = [...new Map(
    lookupValueBatches.flatMap((batch, index) => batch.map((value) => ({
      ...value,
      typeId: value.typeId ?? lookupRequests[index].type.id,
      bgId: value.bgId ?? lookupRequests[index].businessGroupId,
    }))).map((value) => [String(value.id), value]),
  ).values()]

  const references = {
    businessUnits,
    departments,
    designations,
    departmentDesignationMappings,
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
    departmentOptions: mappedBusinessUnitOptions(
      departments,
      departmentDesignationMappings,
      'deptId',
      'departmentName',
    ),
    designationOptions: mappedBusinessUnitOptions(
      designations,
      departmentDesignationMappings,
      'desigId',
      'designationName',
      { mappingKey: 'deptId', optionKey: 'departmentId' },
    ),
    genderOptions: toSelectOptions(fixedGenderOptions),
    religionOptions: toSelectOptions(fixedReligionOptions),
    bloodGroupOptions: toSelectOptions(fixedBloodGroupOptions),
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
