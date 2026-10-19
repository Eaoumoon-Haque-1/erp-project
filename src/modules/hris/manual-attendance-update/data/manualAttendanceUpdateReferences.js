/** @file Loads real reference options used by Manual Attendance Update. */
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationsApi } from '../../designation/api/designationApi'
import { designationDepartmentMappingsApi } from '../../designation-department-mapping/api/designationDepartmentMappingApi'
import { shiftsApi } from '../../shift/api/shiftApi'

const text = (value) => value == null ? '' : String(value)
const active = (record) => text(record.status ?? 1) === '1'

export async function loadManualAttendanceUpdateReferences() {
  const [groups, units, departments, designations, mappings, shifts] = await Promise.all([
    businessGroupsApi.list(), businessUnitsApi.list(), departmentsApi.list(),
    designationsApi.list(), designationDepartmentMappingsApi.list(), shiftsApi.list(),
  ])
  return {
    groups, units, departments, designations, mappings, shifts,
    groupNames: new Map(groups.map((item) => [text(item.id), item.groupName])),
    unitNames: new Map(units.map((item) => [text(item.id), item.businessUnit])),
    departmentNames: new Map(departments.map((item) => [text(item.id), item.departmentName])),
    designationNames: new Map(designations.map((item) => [text(item.id), item.designationName])),
    shiftNames: new Map(shifts.map((item) => [text(item.id), item.shiftTitle])),
  }
}

export function getManualAttendanceUpdateOptions(references, values, preserve = {}) {
  if (!references) return { businessGroups: [], businessUnits: [], departments: [], designations: [], shifts: [] }
  const bgId = text(values.BG_ID)
  const buId = text(values.BU_ID)
  const deptId = text(values.DEPT_ID)
  const include = (record, selectedId) => active(record) || text(record.id) === text(selectedId)
  const unitMappings = references.mappings.filter((item) => text(item.buId) === buId && (
    active(item) || (
      text(item.deptId) === text(preserve.DEPT_ID)
      && text(item.desigId) === text(preserve.DESIG_ID)
    )
  ))
  const mappedDepartmentIds = new Set(unitMappings.map((item) => text(item.deptId)))
  const mappedDesignationIds = new Set(unitMappings.filter((item) => text(item.deptId) === deptId).map((item) => text(item.desigId)))

  return {
    businessGroups: references.groups.filter((item) => include(item, preserve.BG_ID)).map((item) => ({ ID: text(item.id), GROUP_NAME: item.groupName })),
    businessUnits: references.units.filter((item) => text(item.bgId) === bgId).filter((item) => include(item, preserve.BU_ID)).map((item) => ({ ID: text(item.id), BUSINESS_UNIT: item.businessUnit })),
    departments: references.departments.filter((item) => mappedDepartmentIds.has(text(item.id))).filter((item) => include(item, preserve.DEPT_ID)).map((item) => ({ ID: text(item.id), DEPARTMENT: item.departmentName })),
    designations: references.designations.filter((item) => mappedDesignationIds.has(text(item.id))).filter((item) => include(item, preserve.DESIG_ID)).map((item) => ({ ID: text(item.id), DESIGNATION: item.designationName })),
    shifts: references.shifts.filter((item) => text(item.buId) === buId).filter((item) => include(item, preserve.SHIFT_ID)).map((item) => ({ ID: text(item.id), SHIFT_TITLE: item.shiftTitle })),
  }
}
