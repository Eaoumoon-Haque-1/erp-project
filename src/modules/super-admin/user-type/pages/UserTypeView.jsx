/** @file Read-only User Type details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { userTypesApi } from '../api/userTypeApi'

const viewConfig = {
  title: 'User Type View',
  param: 'userTypeId',
  listTo: '/super-admin/user-creation/user-type',
  editTo: (id) => `/super-admin/user-creation/user-type/${id}/edit`,
  loader: async (id) => {
    const [userType, groups] = await Promise.all([
      userTypesApi.get(id),
      businessGroupsApi.list(),
    ])
    return {
      ...userType,
      groupName: groups.find((group) => String(group.id) === String(userType.bgId))?.groupName,
    }
  },
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Type Name', key: 'typeName' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function UserTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default UserTypeView
