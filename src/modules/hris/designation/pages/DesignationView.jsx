/** @file Read-only Designation details loaded from the Designation and Business Group APIs. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { designationsApi } from '../api/designationApi'
import { mapDesignationFromApi } from '../data/designationApiMapper'

const basePath = '/hris/employee-settings/designation'

async function loadDesignation(id) {
  const [designation, groups] = await Promise.all([
    designationsApi.get(id),
    businessGroupsApi.list(),
  ])
  const groupNames = new Map(groups.map((group) => [String(group.id), group.groupName]))
  return mapDesignationFromApi(designation, groupNames)
}

const viewConfig = {
  title: 'Designation View',
  param: 'designationId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: loadDesignation,
  fields: [
    { label: 'Group Name', key: 'GROUP_NAME' },
    { label: 'Designation Name', key: 'DESIGNATION_NAME' },
    { label: 'Short Name', key: 'SHORT_NAME' },
    { label: 'Sort Order', key: 'SORT_ORDER' },
    { label: 'Status', value: (record) => record.STATUS, type: 'status' },
  ],
}

function DesignationView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default DesignationView
