/** @file Read-only Employment Type details loaded from the API. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { employmentTypesApi } from '../api/employmentTypeApi'

const basePath = '/hris/employee-settings/employment-type'
const viewConfig = {
  title: 'Employment Type View',
  param: 'employmentTypeId',
  listTo: basePath,
  editTo: (id) => `${basePath}/${id}/edit`,
  loader: employmentTypesApi.get,
  fields: [
    { label: 'Type Name', key: 'typeName' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Sort Order', key: 'sortOrder' },
    { label: 'Status', value: (record) => record.status, type: 'status' },
  ],
}

function EmploymentTypeView() {
  return <ApiRecordViewPage {...viewConfig} />
}

export default EmploymentTypeView
