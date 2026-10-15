/** @file Read-only Leave Type assignment details loaded from related APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { businessUnitsApi } from '../../../super-admin/business-unit/api/businessUnitApi'
import { leaveTypesApi } from '../../leave-type/api/leaveTypeApi'
import { leaveTypeGroupsApi } from '../api/leaveTypeGroupApi'

const basePath = '/hris/leave-settings/leave-type-assign'

async function loadAssignment(id) {
  const assignment = await leaveTypeGroupsApi.get(id)
  const [group, unit, leaveType] = await Promise.all([
    businessGroupsApi.get(assignment.bgId),
    businessUnitsApi.get(assignment.buId),
    leaveTypesApi.get(assignment.leaveTypeId),
  ])
  return {
    ...assignment,
    groupName: group.groupName,
    businessUnitName: unit.businessUnit,
    leaveTypeName: leaveType.typeName,
  }
}

const viewConfig = {
  title: 'Leave Type Assign View',
  param: 'assignmentId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadAssignment,
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Leave Type', key: 'leaveTypeName' },
    { label: 'Business Unit', key: 'businessUnitName' },
    { label: 'Status', value: (record) => record.status, type: 'status' },
  ],
}

function LeaveTypeAssignView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default LeaveTypeAssignView
