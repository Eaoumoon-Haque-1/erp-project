/** @file Read-only User Type details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { userTypesApi } from '../api/userTypeApi'

const viewConfig = {
  title: 'User Type View',
  param: 'userTypeId',
  listTo: '/super-admin/user-creation/user-type',
  editTo: (id) => `/super-admin/user-creation/user-type/${id}/edit`,
  loader: userTypesApi.get,
  fields: [
    { label: 'Type Name', key: 'userType' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function UserTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default UserTypeView
