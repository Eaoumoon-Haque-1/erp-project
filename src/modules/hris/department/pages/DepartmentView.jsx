/** @file Read-only Department details loaded from the Department and Business Group APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { departmentsApi } from '../api/departmentApi'
import { mapDepartmentFromApi } from '../data/departmentApiMapper'

const basePath = '/hris/employee-settings/department'

async function loadDepartment(id) {
  const [department, groups] = await Promise.all([
    departmentsApi.get(id),
    businessGroupsApi.list(),
  ])
  const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
  return mapDepartmentFromApi(department, groupNames)
}

const viewConfig = {
  title: 'Department View',
  param: 'departmentId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadDepartment,
  fields: [
    { label: 'Group Name', key: 'GROUP_NAME' },
    { label: 'Department Name', key: 'DEPARTMENT_NAME' },
    { label: 'Short Name', key: 'SHORT_NAME' },
    { label: 'Sort Order', key: 'SORT_ORDER' },
    { label: 'Status', value: (record) => record.STATUS, type: 'status' },
  ],
}

function DepartmentView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default DepartmentView
