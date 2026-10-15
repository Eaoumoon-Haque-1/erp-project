/** @file Read-only Department–Designation mapping details loaded from related APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { departmentsApi } from '../../department/api/departmentApi'
import { designationsApi } from '../../designation/api/designationApi'
import { designationDepartmentMappingsApi } from '../api/designationDepartmentMappingApi'

const basePath = '/hris/employee-settings/designation-department-mapping'

async function loadMapping(id) {
  const mapping = await designationDepartmentMappingsApi.get(id)
  const [group, unit, department, designation] = await Promise.all([
    businessGroupsApi.get(mapping.bgId),
    businessUnitsApi.get(mapping.buId),
    departmentsApi.get(mapping.deptId),
    designationsApi.get(mapping.desigId),
  ])
  return {
    ...mapping,
    groupName: group.groupName,
    businessUnitName: unit.businessUnit,
    departmentName: department.departmentName,
    designationName: designation.designationName,
  }
}

const viewConfig = {
  title: 'Designation Department Mapping View',
  param: 'mappingId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadMapping,
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Business Unit', key: 'businessUnitName' },
    { label: 'Department Name', key: 'departmentName' },
    { label: 'Designation Name', key: 'designationName' },
    { label: 'Status', value: (record) => record.status, type: 'status' },
  ],
}

function DesignationDepartmentMappingView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default DesignationDepartmentMappingView
