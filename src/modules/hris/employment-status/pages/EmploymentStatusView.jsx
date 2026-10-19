/** @file Read-only Employment Status details with API audit information. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { employmentStatusesApi } from '../api/employmentStatusApi'
import { mapEmploymentStatusFromApi } from '../data/employmentStatusApiMapper'

const basePath = '/hris/employee-settings/employment-status'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

const fields = [
  { label: 'Status Name', key: 'STATUS_NAME' },
  { label: 'Short Name', key: 'SHORT_NAME' },
  { label: 'Sort Order', key: 'SORT_ORDER' },
  { label: 'Status', key: 'STATUS', type: 'status' },
]
const auditFields = [
  { label: 'Created By', key: 'CREATED_BY' },
  { label: 'Created At', value: (record) => formatDateTime(record.CREATED_AT) },
  { label: 'Updated By', key: 'UPDATED_BY' },
  { label: 'Updated At', value: (record) => formatDateTime(record.UPDATED_AT) },
]

function EmploymentStatusView() {
  return <ApiRecordViewPage title={'Employment Status View'} param={'employmentStatusId'}
    listTo={basePath} editTo={(id) => `${basePath}/${id}/edit`}
    loader={async (id) => mapEmploymentStatusFromApi(await employmentStatusesApi.get(id))}
    fields={fields} auditFields={auditFields} />
}

export default EmploymentStatusView
