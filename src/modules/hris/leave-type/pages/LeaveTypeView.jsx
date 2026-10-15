/** @file Read-only Leave Type details loaded from related APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { leaveTypesApi } from '../api/leaveTypeApi'
import { mapLeaveTypeFromApi } from '../data/leaveTypeApiMapper'

const basePath = '/hris/leave-settings/leave-type'

async function loadLeaveType(id) {
  const [record, groups] = await Promise.all([leaveTypesApi.get(id), businessGroupsApi.list()])
  return mapLeaveTypeFromApi(record, new Map(groups.map((group) => [String(group.id), group.groupName])))
}

const viewConfig = {
  title: 'Leave Type View',
  param: 'leaveTypeId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadLeaveType,
  fields: [
    { label: 'Group Name', key: 'GROUP_NAME' },
    { label: 'Type Name', key: 'TYPE_NAME' },
    { label: 'Short Name', key: 'SHORT_NAME' },
    { label: 'Sort Order', key: 'SORT_ORDER' },
    { label: 'Status', value: (record) => record.STATUS, type: 'status' },
  ],
}

function LeaveTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default LeaveTypeView
