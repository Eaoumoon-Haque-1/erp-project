/** @file Read-only Leave Application details with API audit information. */
import ApiRecordViewPage from '../../../../components/shared/ApiRecordViewPage'
import { formatDateForDisplay } from '../../../../utils/dateFormat'
import { leaveApplicationsApi } from '../api/leaveApplicationApi'
import { mapLeaveApplicationFromApi } from '../data/leaveApplicationApiMapper'
import { loadLeaveApplicationReferences } from '../data/leaveApplicationReferences'

const basePath = '/hris/hris-forms/leave-application'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}

async function loadLeaveApplication(id) {
  const [record, references] = await Promise.all([
    leaveApplicationsApi.get(id),
    loadLeaveApplicationReferences(),
  ])
  return mapLeaveApplicationFromApi(record, references)
}

const fields = [
  { label: 'Business Unit', key: 'BUSINESS_UNIT' },
  { label: 'Employee', key: 'EMPLOYEE_NAME' },
  { label: 'Department', key: 'DEPARTMENT' },
  { label: 'Designation', key: 'DESIGNATION' },
  { label: 'Employee Type', key: 'EMPLOYEE_TYPE' },
  { label: 'From Date', value: (record) => formatDateForDisplay(record.FROM_DATE) },
  { label: 'To Date', value: (record) => formatDateForDisplay(record.TO_DATE) },
  { label: 'Leave Category', key: 'LEAVE_CATEGORY' },
  { label: 'Total Leave Days', key: 'TOTAL_LEAVE_DAYS' },
  { label: 'Supporting Document', value: (record) => record.SUPPORTING_DOCUMENT ? 'Available' : 'N/A' },
  { label: 'Reason', key: 'REASON', wide: true },
  { label: 'Application Status', value: (record) => record.STATUS === '1' ? 'Submitted' : 'Draft' },
]

const auditFields = [
  { label: 'Created By', key: 'CREATED_BY' },
  { label: 'Created At', value: (record) => formatDateTime(record.CREATED_AT) },
  { label: 'Updated By', key: 'UPDATED_BY' },
  { label: 'Updated At', value: (record) => formatDateTime(record.UPDATED_AT) },
]

function LeaveApplicationView() {
  return <ApiRecordViewPage title={'Leave Application View'} param={'leaveApplicationId'}
    listTo={basePath} editTo={(id, record) => record.STATUS === '0' ? `${basePath}/${id}/edit` : ''}
    loader={loadLeaveApplication} fields={fields} auditFields={auditFields} />
}

export default LeaveApplicationView
