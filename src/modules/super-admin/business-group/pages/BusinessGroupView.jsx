/** @file Read-only Business Group details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { businessGroupsApi } from '../api/businessGroupApi'

const viewConfig = {
  title: 'Business Group View',
  param: 'businessGroupId',
  listTo: '/super-admin/business-group',
  editTo: (id) => `/super-admin/business-group/${id}/edit`,
  loader: businessGroupsApi.get,
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
    { label: 'Business Group Logo', key: 'bgLogo', type: 'image', wide: true },
  ],
}

function BusinessGroupView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default BusinessGroupView
