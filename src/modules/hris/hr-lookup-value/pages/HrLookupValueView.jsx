/** @file Read-only HR Lookup Value details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { businessGroupsApi } from '../../../super-admin/business-group/api/businessGroupApi'
import { hrLookupTypesApi } from '../../hr-lookup-type/api/hrLookupTypeApi'
import { hrLookupValuesApi } from '../api/hrLookupValueApi'

const basePath = '/hris/hr-lookup-settings/hr-lookup-value'

const viewConfig = {
  title: 'HR Lookup Value View',
  param: 'lookupValueId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: async (id) => {
    const [record, groups, types] = await Promise.all([
      hrLookupValuesApi.get(id),
      businessGroupsApi.list(),
      hrLookupTypesApi.list(),
    ])
    const group = groups.find((item) => String(item.id) === String(record.bgId))
    const type = types.find((item) => String(item.id) === String(record.typeId))
    return {
      ...record,
      groupName: group?.groupName,
      typeName: type?.typeName,
    }
  },
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Type', key: 'typeName' },
    { label: 'Value', key: 'value' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function HrLookupValueView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default HrLookupValueView
