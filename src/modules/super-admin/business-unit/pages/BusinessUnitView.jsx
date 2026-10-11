/** @file Read-only Business Unit details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { businessGroupsApi } from '../../business-group/api/businessGroupApi'
import { businessUnitsApi } from '../api/businessUnitApi'

const viewConfig = {
  title: 'Business Unit View',
  param: 'businessUnitId',
  listTo: '/super-admin/business-unit',
  editTo: (id) => `/super-admin/business-unit/${id}/edit`,
  loader: async (id) => {
    const unit = await businessUnitsApi.get(id)
    const group = unit.bgId ? await businessGroupsApi.get(unit.bgId) : null
    return { ...unit, groupName: group?.groupName }
  },
  fields: [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Business Unit', key: 'businessUnit' },
    { label: 'Address', key: 'address' },
    { label: 'Email', key: 'email' },
    { label: 'Mobile No', key: 'mobileNo' },
    { label: 'Web Address', key: 'webAddress' },
    { label: 'Report Header', key: 'reportHeader' },
    { label: 'Report Footer', key: 'reportFooter' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
    { label: 'Business Unit Logo', key: 'buLogo', type: 'image', wide: true },
  ],
}

function BusinessUnitView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default BusinessUnitView
