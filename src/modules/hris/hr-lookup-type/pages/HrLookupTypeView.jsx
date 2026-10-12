/** @file Read-only HR Lookup Type details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { getRecordStatus } from '../../../../utils/recordValues'
import { hrLookupTypesApi } from '../api/hrLookupTypeApi'

const basePath = '/hris/hr-lookup-settings/hr-lookup-type'

const viewConfig = {
  title: 'HR Lookup Type View',
  param: 'lookupTypeId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: hrLookupTypesApi.get,
  fields: [
    { label: 'Type Name', key: 'typeName' },
    { label: 'Code', key: 'code' },
    { label: 'Status', value: getRecordStatus, type: 'status' },
  ],
}

function HrLookupTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default HrLookupTypeView
